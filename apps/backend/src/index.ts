import { config } from '@cher-journal/config';
import { logger } from '@cher-journal/utils';
import { createApp } from './app';

async function main() {
  try {
    const app = await createApp();
    
    await app.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(`🚀 Backend server listening on ${config.host}:${config.port}`);
    logger.info(`📝 Environment: ${config.env}`);
    logger.info(`🌐 CORS origins: ${config.corsOrigins.join(', ')}`);
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

main();
