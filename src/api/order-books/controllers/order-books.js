'use strict';

module.exports = {
  async orderBooks(ctx) {
    try {
      const { products, address, guest } = ctx.request.body || {};

      if (!Array.isArray(products) || !address || !guest) {
        return ctx.badRequest('Missing or invalid payload', { products, address, guest });
      }

      // If clients sometimes send a whole product object, normalize it to an ID:
      for (const p of products) {
        if (p && typeof p.product === 'object' && p.product?.id) {
          p.product = p.product.id;
        }
        if (!p?.product) {
          return ctx.badRequest('Each item in products must include product (ID or object with id)');
        }
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
