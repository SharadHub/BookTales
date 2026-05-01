const dotenv = require('dotenv');

dotenv.config();

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI'
];

const optionalEnvVars = {
  PORT: '5000',
  NODE_ENV: 'development',
  ADMIN_EMAIL: 'admin@example.com'
};

const validateEnv = () => {
  const missingVars = [];

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    process.exit(1);
  }

  Object.entries(optionalEnvVars).forEach(([varName, defaultValue]) => {
    if (!process.env[varName]) {
      process.env[varName] = defaultValue;
    }
  });

  if (process.env.PORT && isNaN(process.env.PORT)) {
    process.exit(1);
  }
};

module.exports = validateEnv;
