import { ConfigService } from '@nestjs/config';

const DEV_JWT_SECRET = 'tripconnect-local-dev-secret-change-me';

export function getJwtSecret(config: ConfigService) {
  const secret = config.get<string>('JWT_SECRET')?.trim();

  if (secret) {
    return secret;
  }

  if (config.get<string>('NODE_ENV') === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }

  return DEV_JWT_SECRET;
}
