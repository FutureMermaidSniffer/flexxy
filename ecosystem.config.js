module.exports = {
  apps: [{
    name: 'flexjobs-uk',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: process.env.PORT || 3005,
      API_HOST: process.env.API_HOST || 'localhost',
      API_PORT: process.env.API_PORT || 3005,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_USER: process.env.DB_USER || 'postgres',
      DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
      DB_NAME: process.env.DB_NAME || 'flexjobs_db',
      DB_PORT: process.env.DB_PORT || 5432,
      USE_REDIS: process.env.USE_REDIS || false,
      JWT_SECRET: process.env.JWT_SECRET || 'GenerateSecureJWTSecret32CharactersLong!',
      SESSION_SECRET: process.env.SESSION_SECRET || 'GenerateSecureSessionSecret32CharactersLong!',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@flexjob.uk',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'GenerateSecureAdminPassword123!',
      DOMAIN: process.env.DOMAIN || 'flexjob.uk',
      SSL_EMAIL: process.env.SSL_EMAIL || 'admin@flexjob.uk',
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'https://flexjob.uk,http://flexjob.uk,https://www.flexjob.uk,http://www.flexjob.uk'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3005,
      API_HOST: process.env.API_HOST || 'localhost',
      API_PORT: process.env.API_PORT || 3005,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_USER: process.env.DB_USER || 'postgres',
      DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
      DB_NAME: process.env.DB_NAME || 'flexjobs_db',
      DB_PORT: process.env.DB_PORT || 5432,
      USE_REDIS: process.env.USE_REDIS || false,
      JWT_SECRET: process.env.JWT_SECRET || 'GenerateSecureJWTSecret32CharactersLong!',
      SESSION_SECRET: process.env.SESSION_SECRET || 'GenerateSecureSessionSecret32CharactersLong!',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@flexjob.uk',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'GenerateSecureAdminPassword123!',
      DOMAIN: process.env.DOMAIN || 'flexjob.uk',
      SSL_EMAIL: process.env.SSL_EMAIL || 'admin@flexjob.uk',
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'https://flexjob.uk,http://flexjob.uk,https://www.flexjob.uk,http://www.flexjob.uk'
    }
  }]
}
