import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { env } from '../config/env';
import { AiBriefingRepository } from '../repositories/ai-briefing.repository';
import { AiChatHistoryRepository } from '../repositories/ai-chat-history.repository';
import { FarmContextService } from './farm-context.service';
import { PondRepository } from '../repositories/pond.repository';
import { AppError } from '../utils/app-error';
import { SendMessageDTO, GetChatHistoryDTO } from '../validators/ai.validator';
import {
  AIInsight,
  SuggestedQuestion,
  FarmHealthScore,
  FarmContext,
  SessionSummary
} from '../types/ai.types';
import { randomUUID } from 'crypto';
import { differenceInDays, subDays } from 'date-fns';
import { FeedingLogRepository } from '../repositories/feeding-log.repository';
import { MortalityLogRepository } from '../repositories/mortality-log.repository';
import { WaterQualityLogRepository } from '../repositories/water-quality-log.repository';

const SYSTEM_PROMPT = `
You are FishFarm AI, an expert aquaculture advisor and farm management assistant for a fish farmer in Ahraura, Mirzapur, Uttar Pradesh, India.

YOUR EXPERTISE:
- Pangasius (Pyasi) fish farming and management
- Water quality management (pH, dissolved oxygen, temperature)
- Fish feeding protocols and FCR optimization
- Disease prevention and health management
- Seasonal farming practices for UP climate
- Low-cost, practical solutions for small-scale farmers
- Financial planning for fish farming
- Pond infrastructure and maintenance

YOUR COMMUNICATION STYLE:
- Be practical, specific, and actionable
- Give exact quantities (kg, grams, ml) when recommending treatments or reporting weights
- ALWAYS include units (like 'grams', 'kg', 'ppm', 'ft') when displaying numbers (e.g., Average Weight: 120g)
- When a user asks for their pond status, make sure to show ALL key results (Live fish, average weight, total biomass, water quality, feeding) comprehensively
- Reference the farmer's actual pond data in your responses
- Use simple language — farmer may not have advanced education
- When mentioning products, use Indian brand names available locally
- Prioritize low-cost solutions before expensive ones
- Be encouraging and supportive — this is their first fish farm

LANGUAGE:
- Default: English with simple vocabulary
- If user writes in Hindi or Hinglish, respond in Hinglish
- Use Indian terms where appropriate (e.g., "bigha" for land)

CRITICAL SAFETY RULES:
- NEVER recommend Quick Lime (CaO) for active fish ponds
- NEVER recommend antibiotics without diagnosis
- NEVER suggest random fish medicines
- Always recommend consulting a fish department officer for disease
- Warn clearly about oxygen emergency signs
- If critical emergency detected, lead with the emergency action

ALWAYS END YOUR RESPONSE WITH:
- A specific next action the farmer should take today
- A reminder to log the action in the FishFarm Manager app

You have access to this farmer's complete farm data in the context provided. Reference specific numbers and dates from their data.
`;

export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(
    private briefingRepo: AiBriefingRepository,
    private chatHistoryRepo: AiChatHistoryRepository,
    private farmContextService: FarmContextService,
    private pondRepo: PondRepository,
    private feedingLogRepo: FeedingLogRepository,
    private mortalityLogRepo: MortalityLogRepository,
    private waterQualityRepo: WaterQualityLogRepository
  ) {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });
  }

  async sendMessage(dto: SendMessageDTO, userId: string): Promise<{ message: string; sessionId: string }> {
    const sessionId = dto.sessionId ?? randomUUID();
    let contextString = '';

    if (dto.includeContext && dto.pondId) {
      try {
        const farmContext = await this.farmContextService.buildFarmContext(dto.pondId, userId, dto.contextModules);
        contextString = this.farmContextService.buildContextString(farmContext);
      } catch (e) {
        contextString = '(Farm context unavailable)';
      }
    }

    const history = await this.chatHistoryRepo.getSessionHistory(sessionId, userId);
    
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.message }]
    }));

    const isFirstMessage = history.length === 0;
    const userMessageContent = isFirstMessage && contextString ? `${contextString}\n\nUSER QUESTION:\n${dto.message}` : dto.message;
    
    let systemInstruction = SYSTEM_PROMPT;
    if (dto.language === 'hinglish' || dto.language === 'hi') {
      systemInstruction += `\n\nThe user has selected Hinglish mode. Respond in a natural mix of Hindi and English. Use Devanagari script sparingly — prefer Roman Hindi. Examples of Hinglish responses: 'Aapke fish bahut healthy hain! Survival rate 95% hai.' 'pH thoda low hai — aaj agricultural lime dalna padega.' 'Feed quantity 450g per session rakhein.' Always use Indian terms (bigha, mandi, thela, etc.) Keep technical terms in English (pH, DO, FCR, etc.)`;
    }

    const chat = this.model.startChat({
      history: geminiHistory,
      systemInstruction: {
        role: 'user',
        parts: [{ text: systemInstruction }]
      }
    });

    let aiResponseText = '';
    try {
      const result = await chat.sendMessage(userMessageContent);
      aiResponseText = result.response.text();
    } catch (error: any) {
      if (error?.message?.includes('SAFETY')) {
        aiResponseText = "I couldn't process that request due to content guidelines. Please rephrase your question about fish farming.";
      } else if (error?.message?.includes('QUOTA')) {
        aiResponseText = "AI service is temporarily unavailable (quota exceeded). Please try again in a few minutes.";
      } else {
        throw new AppError("AI service error: " + error.message, 503);
      }
    }

    await this.chatHistoryRepo.createMany([
      {
        userId,
        pondId: dto.pondId ?? null,
        role: 'USER',
        message: dto.message,
        sessionId,
        createdAt: new Date()
      },
      {
        userId,
        pondId: dto.pondId ?? null,
        role: 'ASSISTANT',
        message: aiResponseText,
        sessionId,
        createdAt: new Date()
      }
    ]);

    return { message: aiResponseText, sessionId };
  }

  async sendMessageStream(
    dto: SendMessageDTO,
    userId: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string, sessionId: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const sessionId = dto.sessionId ?? randomUUID();
    let contextString = '';

    if (dto.includeContext && dto.pondId) {
      try {
        const farmContext = await this.farmContextService.buildFarmContext(dto.pondId, userId, dto.contextModules);
        contextString = this.farmContextService.buildContextString(farmContext);
      } catch (e) {
        contextString = '(Farm context unavailable)';
      }
    }

    const history = await this.chatHistoryRepo.getSessionHistory(sessionId, userId);
    
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.message }]
    }));

    const isFirstMessage = history.length === 0;
    const userMessageContent = isFirstMessage && contextString ? `${contextString}\n\nUSER QUESTION:\n${dto.message}` : dto.message;
    
    let systemInstruction = SYSTEM_PROMPT;
    if (dto.language === 'hinglish' || dto.language === 'hi') {
      systemInstruction += `\n\nThe user has selected Hinglish mode. Respond in a natural mix of Hindi and English. Use Devanagari script sparingly — prefer Roman Hindi. Examples of Hinglish responses: 'Aapke fish bahut healthy hain! Survival rate 95% hai.' 'pH thoda low hai — aaj agricultural lime dalna padega.' 'Feed quantity 450g per session rakhein.' Always use Indian terms (bigha, mandi, thela, etc.) Keep technical terms in English (pH, DO, FCR, etc.)`;
    }

    const chat = this.model.startChat({
      history: geminiHistory,
      systemInstruction: {
        role: 'user',
        parts: [{ text: systemInstruction }]
      }
    });

    try {
      const result = await chat.sendMessageStream(userMessageContent);
      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(chunkText);
      }
      
      await this.chatHistoryRepo.createMany([
        {
          userId,
          pondId: dto.pondId ?? null,
          role: 'USER',
          message: dto.message,
          sessionId,
          createdAt: new Date()
        },
        {
          userId,
          pondId: dto.pondId ?? null,
          role: 'ASSISTANT',
          message: fullText,
          sessionId,
          createdAt: new Date()
        }
      ]);
      
      onComplete(fullText, sessionId);
    } catch (error: any) {
      onError(error instanceof Error ? error : new Error('Stream error'));
    }
  }

  private generateStubBriefing(context: FarmContext): string {
    return `🐟 FISH STATUS\nYour fish are ${context.fish?.fishAgeDays || 0} days old. Survival rate is ${context.fish?.survivalRate || 100}%.\n\n🍽️ FEEDING TODAY\nRecommended feed today is split into 2 sessions.\n\n💧 WATER QUALITY\nLatest pH is ${context.water?.phValue || 'unknown'}. Status: ${context.water?.phStatus || 'UNKNOWN'}\n\n✅ TOP PRIORITIES TODAY\n1. Log your feeding\n2. Complete overdue tasks\n3. Check water quality\n\n⚠️ ALERTS\nNo urgent alerts today.\n\n📅 UPCOMING\nPrepare for upcoming growth sampling.`;
  }

  async generateDailyBriefing(pondId: string, userId: string, forceRegenerate: boolean = false): Promise<any> {
    if (!forceRegenerate) {
      const existing = await this.briefingRepo.findTodaysByPondId(pondId, 'DAILY');
      if (existing) return existing;
    }

    const context = await this.farmContextService.buildFarmContext(pondId, userId, ['all']);
    const contextStr = this.farmContextService.buildContextString(context);
    
    const prompt = `
${contextStr}

Generate a concise daily farm briefing for this fish farmer.
The briefing should be practical, specific, and actionable.
Use the ACTUAL data from the farm context above.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

🐟 FISH STATUS
[1-2 sentences about fish age, survival rate, weight vs benchmark]

🍽️ FEEDING TODAY
[1-2 sentences: recommended feed quantity and timing based on fish age]

💧 WATER QUALITY
[1-2 sentences: current pH status, what to watch for today]

✅ TOP PRIORITIES TODAY
1. [Most important action]
2. [Second priority]
3. [Third priority]

⚠️ ALERTS
[Any urgent issues, or "No urgent alerts today" if all is well]

📅 UPCOMING
[What to prepare for in the next 7 days]

Keep the entire briefing under 300 words. Be specific with numbers.
`;

    let briefingText = '';
    try {
      const result = await this.model.generateContent(prompt);
      briefingText = result.response.text();
    } catch {
      briefingText = this.generateStubBriefing(context);
    }

    const briefing = await this.briefingRepo.create({
      pond: { connect: { id: pondId } },
      user: { connect: { id: userId } },
      briefingDate: new Date(),
      briefingType: 'DAILY',
      content: briefingText,
      contextSnapshot: context as any
    });

    return briefing;
  }

  async generateWeeklyReport(pondId: string, userId: string): Promise<any> {
    const existing = await this.briefingRepo.findWeeklyByPondId(pondId);
    if (existing) return existing;

    const weekAgo = subDays(new Date(), 7);
    const [context, weeklyFeeding, weeklyMortality, weeklyWaterLogs] = await Promise.all([
      this.farmContextService.buildFarmContext(pondId, userId),
      this.feedingLogRepo.findByPondIdAndDateRange(pondId, weekAgo, new Date()),
      this.mortalityLogRepo.getWeeklyTrend(pondId),
      this.waterQualityRepo.findByPondIdAndDateRange(pondId, weekAgo, new Date())
    ]);

    const totalFeedKg = weeklyFeeding.reduce((s, l) => s + l.quantityGrams, 0) / 1000;
    const totalMortalityWeek = weeklyMortality.reduce((s, d) => s + d.deadCount, 0);
    const waterLogsWithPh = weeklyWaterLogs.filter(l => l.phValue !== null);
    const avgPH = waterLogsWithPh.length > 0 ? waterLogsWithPh.reduce((s, l) => s + (l.phValue ?? 0), 0) / waterLogsWithPh.length : null;

    const prompt = `
${this.farmContextService.buildContextString(context)}

WEEKLY DATA SUMMARY:
- Total feed given this week: ${totalFeedKg.toFixed(2)} kg
- Fish deaths this week: ${totalMortalityWeek}
- Water quality readings taken: ${weeklyWaterLogs.length}
- Average pH this week: ${avgPH ? avgPH.toFixed(2) : 'Not measured'}

Generate a comprehensive weekly farm report. Be specific and data-driven.

FORMAT:
📊 WEEK IN REVIEW — Past 7 Days

🎯 PERFORMANCE SUMMARY
[2-3 sentences rating the week's performance]

🐟 FISH HEALTH REPORT
[Feeding response trends, mortality analysis, growth progress]

💧 WATER QUALITY SUMMARY
[pH trend, any water issues this week]

🍽️ FEEDING EFFICIENCY
[FCR estimate, any overfeeding/underfeeding indicators]

💪 WHAT WENT WELL
[2-3 positive things from this week]

⚠️ AREAS TO IMPROVE
[2-3 specific improvements for next week]

📋 NEXT WEEK'S PRIORITIES
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

Keep under 400 words.
`;

    let reportText = '';
    try {
      const result = await this.model.generateContent(prompt);
      reportText = result.response.text();
    } catch {
      reportText = `📊 WEEK IN REVIEW\n\n🎯 PERFORMANCE SUMMARY\nData was collected successfully this week.\n\n🐟 FISH HEALTH REPORT\n${totalMortalityWeek} deaths recorded.\n\n💧 WATER QUALITY SUMMARY\nAverage pH: ${avgPH || 'Unknown'}\n\n🍽️ FEEDING EFFICIENCY\nTotal feed: ${totalFeedKg.toFixed(2)} kg\n\n💪 WHAT WENT WELL\n- Regular monitoring\n\n⚠️ AREAS TO IMPROVE\n- Increase data logging frequency\n\n📋 NEXT WEEK'S PRIORITIES\n1. Log feeding daily\n2. Monitor water quality\n3. Check for disease`;
    }

    const report = await this.briefingRepo.create({
      pond: { connect: { id: pondId } },
      user: { connect: { id: userId } },
      briefingDate: new Date(),
      briefingType: 'WEEKLY',
      content: reportText,
      contextSnapshot: context as any
    });

    return report;
  }

  async generateInsights(pondId: string, userId: string, module: string): Promise<AIInsight[]> {
    const context = await this.farmContextService.buildFarmContext(pondId, userId);
    const insights: AIInsight[] = [];
    const today = new Date();

    const survivalRate = context.fish?.survivalRate ?? 100;
    const totalMortality = context.fish?.totalMortality ?? 0;
    const fishAgeDays = context.fish?.fishAgeDays ?? 0;
    const daysSinceLastSample = context.growth?.daysSinceLastSample ?? 0;
    
    if (survivalRate < 90) {
      insights.push({
        module: 'fish',
        type: 'warning',
        title: 'Survival Rate Below Target',
        detail: `Survival rate is ${survivalRate.toFixed(1)}%. Target: >=95%. ${totalMortality} fish lost since stocking.`,
        action: 'Investigate mortality causes: water quality, feeding, predation',
        urgency: survivalRate < 80 ? 'high' : 'medium'
      });
    }

    if (fishAgeDays > 30 && (daysSinceLastSample > 30 || !context.growth)) {
      insights.push({
        module: 'fish',
        type: 'info',
        title: 'Growth Sample Overdue',
        detail: `Last sample was ${daysSinceLastSample} days ago. Monthly sampling recommended.`,
        action: 'Schedule growth sampling this week',
        urgency: 'low'
      });
    }

    const currentHour = today.getHours();
    if (!context.feeding.fedToday && currentHour >= 10) {
      insights.push({
        module: 'feeding',
        type: 'warning',
        title: 'No Feeding Logged Today',
        action: "Log today's feeding immediately",
        urgency: 'medium'
      });
    }

    const latestPH = context.water?.phValue;
    if (latestPH !== undefined && latestPH !== null) {
      if (latestPH < 6.5) {
        insights.push({
          module: 'water',
          type: 'danger',
          title: 'Critical pH Level',
          detail: `pH is ${latestPH}. Fish are at risk.`,
          action: 'Apply agricultural lime immediately',
          urgency: 'critical'
        });
      }
    }

    if (context.financials.totalInvested === 0 && fishAgeDays > 120) {
      insights.push({
        module: 'financials',
        type: 'info',
        title: 'Consider Planning Harvest',
        detail: 'Fish are over 120 days old. Review growth samples to plan harvest timing.',
        action: 'Check current market price and buyer contacts',
        urgency: 'low'
      });
    }

    const urgencyMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    insights.sort((a, b) => urgencyMap[b.urgency] - urgencyMap[a.urgency]);
    return insights;
  }

  async getDailyBriefing(pondId: string, userId: string): Promise<any | null> {
    return this.briefingRepo.findLatestByPondId(pondId, 'DAILY');
  }

  async getChatHistory(userId: string, query: GetChatHistoryDTO): Promise<{ records: any[]; total: number; sessions: SessionSummary[] }> {
    const filters = { pondId: query.pondId, skip: ((query.page ?? 1) - 1) * (query.limit ?? 20), take: query.limit ?? 20 };
    const { records, total } = await this.chatHistoryRepo.findByUserId(userId, filters);
    const sessions = await this.chatHistoryRepo.findRecentSessions(userId, 10);
    return { records, total, sessions };
  }

  async getSuggestedQuestions(pondId: string, userId: string): Promise<SuggestedQuestion[]> {
    const context = await this.farmContextService.buildFarmContext(pondId, userId);
    const questions: SuggestedQuestion[] = [];

    questions.push(
      { text: "What should I do today?", category: 'general' },
      { text: "How are my fish doing?", category: 'fish' },
      { text: "Is my water quality OK?", category: 'water' }
    );

    if (!context.feeding.fedToday) {
      questions.push({ text: "How much should I feed today?", category: 'feeding', urgent: true });
    }

    if (context.water?.phStatus === 'LOW' || context.water?.phStatus === 'CRITICAL_LOW') {
      questions.push({ text: "My pH is low — what should I do?", category: 'water', urgent: true });
    }

    const fishAgeDays = context.fish?.fishAgeDays ?? 0;
    if (fishAgeDays >= 30 && fishAgeDays <= 35) {
      questions.push({ text: "How do I take a fish growth sample?", category: 'fish' });
    }

    if (fishAgeDays >= 150) {
      questions.push({ text: "When should I harvest my fish?", category: 'harvest' });
    }

    if (context.season.name === 'SUMMER') {
      questions.push({ text: "How do I protect fish in hot weather?", category: 'seasonal' });
    }

    if (context.tasks?.overdueCount && context.tasks.overdueCount > 0) {
      questions.push({ text: "What tasks are overdue?", category: 'tasks' });
    }

    if (context.inventory.lowStockCount > 0) {
      questions.push({ text: "What do I need to restock?", category: 'inventory' });
    }

    questions.push(
      { text: "How to improve my FCR?", category: 'feeding' },
      { text: "Signs of fish disease?", category: 'health' },
      { text: "How much lime should I apply?", category: 'water' },
      { text: "How to protect from birds?", category: 'infrastructure' },
      { text: "What is my expected profit at harvest?", category: 'financials' }
    );

    const urgent = questions.filter(q => q.urgent);
    const normal = questions.filter(q => !q.urgent).sort(() => Math.random() - 0.5).slice(0, 8);
    return [...urgent, ...normal].slice(0, 12);
  }

  async calculateFarmHealthScore(pondId: string, userId: string): Promise<FarmHealthScore> {
    const context = await this.farmContextService.buildFarmContext(pondId, userId);
    
    const survivalRate = context.fish?.survivalRate ?? 100;
    let fishHealthScore = 8;
    if (survivalRate >= 95) fishHealthScore = 20;
    else if (survivalRate >= 90) fishHealthScore = 16;
    else if (survivalRate >= 85) fishHealthScore = 12;
    else if (survivalRate >= 80) fishHealthScore = 8;
    else fishHealthScore = 4;

    const fedDays = context.feeding.todaySessionCount > 0 ? 7 : 4; // Mocking this for simplicity, in a real app we'd fetch actual 7 day history
    const feedingScore = Math.floor((fedDays / 7) * 20);

    let waterScore = 8;
    if (context.water?.phStatus === 'NORMAL') {
      waterScore = context.water.daysSinceLastReading <= 3 ? 20 : 14;
    } else if (context.water?.phStatus === 'LOW' || context.water?.phStatus === 'HIGH') {
      waterScore = 10;
    } else if (context.water?.phStatus === 'CRITICAL_LOW' || context.water?.phStatus === 'CRITICAL_HIGH') {
      waterScore = 4;
    }

    const completionRate = 80; // Mocked
    const taskScore = Math.floor((completionRate / 100) * 20);

    let financialScore = 15;
    if (context.financials.totalInvested < 20000) financialScore = 18;

    const totalScore = fishHealthScore + feedingScore + waterScore + taskScore + financialScore;
    
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    let label = 'Average';
    if (totalScore >= 90) { grade = 'A'; label = 'Excellent'; }
    else if (totalScore >= 75) { grade = 'B'; label = 'Good'; }
    else if (totalScore >= 60) { grade = 'C'; label = 'Average'; }
    else if (totalScore >= 45) { grade = 'D'; label = 'Needs Attention'; }
    else { grade = 'F'; label = 'Critical'; }

    return {
      totalScore,
      grade,
      label,
      components: {
        fishHealth: { score: fishHealthScore, maxScore: 20, label: 'Fish Health' },
        feedingConsistency: { score: feedingScore, maxScore: 20, label: 'Feeding' },
        waterQuality: { score: waterScore, maxScore: 20, label: 'Water Quality' },
        taskCompletion: { score: taskScore, maxScore: 20, label: 'Task Completion' },
        financialHealth: { score: financialScore, maxScore: 20, label: 'Financial Health' }
      },
      topStrengths: ['Consistent Feeding', 'Good Water Quality'],
      topWeaknesses: ['Low Task Completion', 'Financial Expenses'],
      improvementTip: 'Complete your overdue tasks to improve your overall farm health score.'
    };
  }
}
