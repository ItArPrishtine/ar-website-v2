'use strict';

module.exports = {
  async orderBooks(ctx) {
    try {
      const { products, address, guest } = ctx.request.body || {};

      if (!Array.isArray(products) || !address || !guest) {
        return ctx.badRequest('Missing or invalid payload', { products, address, guest });
      }

      await strapi
        .service('api::order-books.order-books')
        .sendEmail(products, address, guest);

      // ✅ Return something defined
      ctx.body = { ok: true };
    } catch (err) {
      strapi.log.error('orderBooks error:', err);
      ctx.badRequest('Post report controller error', { moreDetails: err.message || err });
    }
  },
};
