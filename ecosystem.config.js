module.exports = {
  apps: [{
    name: 'flexjobs',
    script: 'server.js',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3005,
      DB_HOST: 'localhost',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'flexjobs_db',
      DB_PORT: 5432,
      USE_REDIS: false,
      JWT_SECRET: 'GenerateSecureJWTSecret32CharactersLong!',
      SESSION_SECRET: 'GenerateSecureSessionSecret32CharactersLong!',
      ADMIN_EMAIL: 'admin@flexjobseu.com',
      ADMIN_PASSWORD: 'GenerateSecureAdminPassword123!',
      DOMAIN: 'flexjobseu.com',
      SSL_EMAIL: 'admin@flexjobseu.com'
    }
  }]
}
