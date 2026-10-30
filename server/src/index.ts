import { ensurePortfolioSeeded } from './seed-data';

export default {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }: { strapi: any }) {
    // Seeds portfolio content and the Page Builder templates/relations on first boot.
    // The Page Builder API key (free at https://pagebuilder.wc8.io) is read from
    // STRAPI_PAGE_BUILDER_API_KEY or entered in Settings > Page Builder.
    await ensurePortfolioSeeded(strapi, false);
  },
};
