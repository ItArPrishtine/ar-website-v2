'use strict';

/**
 * A set of functions called "actions" for `order-books`
 */

module.exports = {
// @ts-ignore
  orderBooks: async (ctx, next) => {
    try {

      const { products, address, guest } = ctx.request.body || {};

      if (!Array.isArray(products) || !address || !guest) {
        return ctx.badRequest('Missing or invalid payload', { products, address, guest });
      }

      await strapi
        .service("api::order-books.order-books")
        .sendEmail(products, address, guest);

      ctx.body = body;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  }
};
