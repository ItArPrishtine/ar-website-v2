interface RouteConfig {
  method: string;
  path: string;
  handler: string;
  config: {
    policies: string[];
  };
}

const routes: RouteConfig[] = [
  {
    method: 'POST',
    path: '/order-books',
    handler: 'order-books.orderBooks',
    config: {
      policies: [],
    },
  },
];

export default {
  routes,
};

