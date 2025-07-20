'use strict';

/**
 * A set of functions called "actions" for `order-books`
 */

const unparsed = Symbol.for('unparsedBody');

module.exports = {
// @ts-ignore
  orderBooks: async (ctx, next) => {
    try {

      const unparsedBody = ctx.request.body[unparsed];
      const body = JSON.parse(unparsedBody);

      await strapi
        .service("api::order-books.order-books")
        .sendEmail(body.products, body.address, body.guest);

      ctx.body = body;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  }
};
