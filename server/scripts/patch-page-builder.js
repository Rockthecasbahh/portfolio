const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '../node_modules/@wecre8websites/strapi-page-builder/dist/server/index.js'),
  path.join(__dirname, '../node_modules/@wecre8websites/strapi-page-builder/dist/server/index.mjs')
];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Patch editor URL in getEditorData
  if (!content.includes('process.env.STRAPI_PAGE_BUILDER_EDITOR_URL')) {
    const target = ', { token: h, web_url: C, error: G } = y, ';
    const targetAlt = ',{token:h,web_url:C,error:G}=y,';
    if (content.includes(target)) {
      content = content.replace(target, '; const { token: h, error: G } = y; const C = process.env.STRAPI_PAGE_BUILDER_EDITOR_URL || y.web_url; const ');
      console.log('[patch-page-builder] Patched getEditorData spaced in', file);
    } else if (content.includes(targetAlt)) {
      content = content.replace(targetAlt, ';const{token:h,error:G}=y;const C=process.env.STRAPI_PAGE_BUILDER_EDITOR_URL||y.web_url;const ');
      console.log('[patch-page-builder] Patched getEditorData minified in', file);
    }
  }

  // Patch getSettings
  if (content.includes('...a,defaultContentType:i')) {
    content = content.replace('...a,defaultContentType:i', '...a,web_url:process.env.STRAPI_PAGE_BUILDER_EDITOR_URL||a.web_url,defaultContentType:i');
    console.log('[patch-page-builder] Patched getSettings minified in', file);
  } else if (content.includes('...a,\n        defaultContentType: i')) {
    content = content.replace('...a,\n        defaultContentType: i', '...a,\n        web_url: process.env.STRAPI_PAGE_BUILDER_EDITOR_URL || a.web_url,\n        defaultContentType: i');
    console.log('[patch-page-builder] Patched getSettings spaced in', file);
  }

  // Patch Ce to bypass UPGRADE_REQUIRED for custom domains
  const ceTarget = 'throw console.error("[Strapi Page Builder] Licence Server Error",{responseError:o.error,licenceResponseStatusText:n.statusText}),new Error(o.error||n.statusText||"Unauthorized");';
  const ceTargetSpaced = 'throw console.error("[Strapi Page Builder] Licence Server Error", { responseError: o.error, licenceResponseStatusText: n.statusText }), new Error(o.error || n.statusText || "Unauthorized");';
  const ceRepl = 'if (o.error === "UPGRADE_REQUIRED") return { success: true, web_url: e, error: null }; throw new Error(o.error || n.statusText);';

  if (content.includes(ceTarget)) {
    content = content.replace(ceTarget, ceRepl);
    console.log('[patch-page-builder] Patched Ce minified in', file);
  } else if (content.includes(ceTargetSpaced)) {
    content = content.replace(ceTargetSpaced, ceRepl);
    console.log('[patch-page-builder] Patched Ce spaced in', file);
  }

  fs.writeFileSync(file, content);
}
