import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';
import './container'; // Ensure container is initialized

const PORT = env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });

    const shutdown = async () => {
      logger.info('Graceful shutdown initiated');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
