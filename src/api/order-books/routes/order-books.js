'use strict';

const routes = [
  {
    method: 'POST',
    path: '/order-books',
    handler: 'order-books.orderBooks',
    config: {
      policies: [],
    },
  },
];

module.exports = {
  routes,
};
