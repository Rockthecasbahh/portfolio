const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '../node_modules/@wecre8websites/strapi-page-builder/dist/server/index.js'),
  path.join(__dirname, '../node_modules/@wecre8websites/strapi-page-builder/dist/server/index.mjs')
];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('process.env.STRAPI_PAGE_BUILDER_EDITOR_URL')) continue;
  const target = ', { token: h, web_url: C, error: G } = y, ';
  const targetAlt = ',{token:h,web_url:C,error:G}=y,';
  if (content.includes(target)) {
    content = content.replace(target, '; const { token: h, error: G } = y; const C = process.env.STRAPI_PAGE_BUILDER_EDITOR_URL || y.web_url; const ');
    fs.writeFileSync(file, content);
    console.log('[patch-page-builder] Patched', file);
  } else if (content.includes(targetAlt)) {
    content = content.replace(targetAlt, ';const{token:h,error:G}=y;const C=process.env.STRAPI_PAGE_BUILDER_EDITOR_URL||y.web_url;const ');
    fs.writeFileSync(file, content);
    console.log('[patch-page-builder] Patched', file);
  }
}
