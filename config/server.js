module.exports = ({ env }) => {
  const rawUrl = env('URL'); // read the env var
  const isValidUrl = rawUrl && rawUrl.startsWith('http'); // basic check

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: env.array('APP_KEYS'),
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
    ...(isValidUrl && { url: rawUrl }), // 👈 only include if it's valid
    proxy: true,
  };
};
