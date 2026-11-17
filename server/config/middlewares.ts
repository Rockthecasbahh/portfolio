const isProd = process.env.NODE_ENV === 'production';
const devFrameOrigins = isProd
  ? []
  : ['http://localhost:4321', 'http://127.0.0.1:4321', 'http://localhost:3000'];
const devAssetOrigins = isProd
  ? []
  : ['http://localhost:4321', 'http://127.0.0.1:4321', 'http://localhost:1337'];

export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': isProd ? ["'self'", 'https:'] : ["'self'", 'https:', 'http:'],
          'frame-src': [
            "'self'",
            'https://matteocasling.com',
            'https://www.youtube.com',
            ...devFrameOrigins,
          ],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'https://matteocasling.com',
            'https://cms.matteocasling.com',
            ...devAssetOrigins,
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'https://matteocasling.com',
            'https://cms.matteocasling.com',
            ...devFrameOrigins,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: isProd
        ? ['https://matteocasling.com', 'https://cms.matteocasling.com']
        : [
            'https://matteocasling.com',
            'https://cms.matteocasling.com',
            'http://localhost:4321',
            'http://127.0.0.1:4321',
            'http://localhost:1337',
            'http://localhost:3000',
          ],
    },
  },
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
