module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
    },
    pool: {
      min: 0,
      max: 3,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000,
    },
    debug: false,
  },
});
