import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { FeedRecommendation, FishResponseType, FeedType } from '../../types/feeding.types';
import { FISH_RESPONSE_CONFIG, FEED_TYPE_CONFIG } from '../../utils/constants';

interface QuickFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  pondId: string;
  recommendation: FeedRecommendation | null;
  onSuccess: () => void;
  onOpenFullForm?: () => void; // Optional to open the full form
}

export const QuickFeedModal: React.FC<QuickFeedModalProps> = ({
  isOpen, onClose, pondId, recommendation, onSuccess, onOpenFullForm
}) => {
  const [quantity, setQuantity] = useState<number | ''>(recommendation?.perSessionGrams || '');
  const [response, setResponse] = useState<FishResponseType>('GOOD');
  const [feedType, setFeedType] = useState<FeedType>('FLOATING_PELLET');
  const [feedTime, setFeedTime] = useState<string>(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  const [leftover, setLeftover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      setIsSubmitting(true);
      const { feedingApi } = await import('../../api/endpoints/feeding.api');
      await feedingApi.createFeedingLog({
        pondId,
        feedDate: new Date().toISOString().split('T')[0],
        feedTime,
        feedType,
        quantityGrams: Number(quantity),
        fishResponse: response,
        leftoverObserved: leftover,
      });
      
      toast.success("⚡ Quick feed logged!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to log feeding");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">⚡ Quick Feed Log</h2>
            <p className="text-xs text-slate-400">Fast entry — add details later if needed</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <div className="flex justify-center gap-2 mb-2 flex-wrap">
              {[350, 400, 450, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantity(val)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${quantity === val ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}
                >
                  {val}g
                </button>
              ))}
              {recommendation && (
                <button
                  type="button"
                  onClick={() => setQuantity(recommendation.perSessionGrams)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border border-green-500 ${quantity === recommendation.perSessionGrams ? 'bg-green-500 text-white' : 'text-green-400'}`}
                >
                  Rec: {recommendation.perSessionGrams}g
                </button>
              )}
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Quantity"
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-sky-500 rounded-lg p-3 text-center text-xl font-bold text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">g</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Fish Response</label>
            <div className="flex justify-between">
              {Object.entries(FISH_RESPONSE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  title={config.label}
                  onClick={() => setResponse(key as FishResponseType)}
                  className={`p-2 rounded-lg text-lg transition-all ${response === key ? config.bgColor + ' border border-transparent ring-1 ring-white/30' : 'bg-slate-800 border border-slate-700 opacity-60 hover:opacity-100'}`}
                >
                  {config.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Feed Type</label>
              <select 
                value={feedType} 
                onChange={e => setFeedType(e.target.value as FeedType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
              >
                {Object.entries(FEED_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Time</label>
              <input 
                type="time" 
                value={feedTime} 
                onChange={e => setFeedTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg border border-slate-700">
            <span className="text-sm text-slate-300">Leftover Observed?</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={leftover} onChange={e => setLeftover(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : null}
            Save Feed Log
          </button>
          
          {onOpenFullForm && (
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => {
                  onClose();
                  onOpenFullForm();
                }}
                className="text-xs text-sky-400 hover:underline"
              >
                Add more details
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
