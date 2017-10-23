const config = {
  default: {
    username: process.env.DB_USERNAME || "borcho",
    password: process.env.DB_PASSWORD || "kame",
    dialect: process.env.DB_DIALECT || 'postgres',
    database: process.env.DB_NAME || "borcho",
    host: process.env.DB_HOST || '127.0.0.1',
  },
  development: {
    extend: 'default',
    database: process.env.DB_NAME, //'iic2513template_dev', production
  },
  test: {
    extend: 'default',
    database: process.env.DB_NAME, //'iic2513template_test',
  },
  production: {
    extend: 'default',
    use_env_variable: 'DATABASE_URL',
  },
};

Object.keys(config).forEach((configKey) => {
  const configValue = config[configKey];
  if (configValue.extend) {
    config[configKey] = Object.assign({}, config[configValue.extend], configValue);
  }
});

module.exports = config;
