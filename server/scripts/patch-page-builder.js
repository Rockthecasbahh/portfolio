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

// Patch Sharp pixel limit & GIF performance in @strapi/upload
const uploadServiceFile = path.join(__dirname, '../node_modules/@strapi/upload/dist/server/services/image-manipulation.js');
if (fs.existsSync(uploadServiceFile)) {
  let uploadContent = fs.readFileSync(uploadServiceFile, 'utf8');
  const sharpNeedle = 'var sharp__default = /*#__PURE__*/_interopDefault(sharp);';
  const sharpRepl = 'var _rawSharp = /*#__PURE__*/_interopDefault(sharp);\n' +
    'var sharp__default = {\n' +
    '  default: function(...args) {\n' +
    '    if (args.length === 0) return _rawSharp.default({ limitInputPixels: false });\n' +
    '    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null && !(args[0] instanceof Buffer) && !(typeof args[0].pipe === "function") && !Array.isArray(args[0])) {\n' +
    '      return _rawSharp.default({ limitInputPixels: false, ...args[0] });\n' +
    '    }\n' +
    '    const [input, opts = {}] = args;\n' +
    '    return _rawSharp.default(input, { limitInputPixels: false, ...opts });\n' +
    '  }\n' +
    '};\n' +
    'Object.assign(sharp__default.default, _rawSharp.default);';

  if (uploadContent.includes(sharpNeedle)) {
    uploadContent = uploadContent.replace(sharpNeedle, sharpRepl);
    console.log('[patch-page-builder] Patched sharp limitInputPixels in', uploadServiceFile);
  }

  // Fast GIF processing: skip multi-breakpoint animated resizing and only extract frame 0 for thumbnails
  const responsiveTarget = 'const generateResponsiveFormats = async (file)=>{\n    const { responsiveDimensions = false }';
  const responsiveRepl = 'const generateResponsiveFormats = async (file)=>{\n    if (file.mime === \'image/gif\' || file.ext === \'.gif\') return [];\n    const { responsiveDimensions = false }';
  if (uploadContent.includes(responsiveTarget)) {
    uploadContent = uploadContent.replace(responsiveTarget, responsiveRepl);
    console.log('[patch-page-builder] Patched skip GIF responsive breakpoints in', uploadServiceFile);
  }

  const animTarget = 'const resizeFileTo = async (file, options, { name, hash })=>{\n    const filePath = file.tmpWorkingDirectory ? path.join(file.tmpWorkingDirectory, hash) : hash;\n    let newInfo;\n    if (!file.filepath) {\n        const transform = sharp__default.default({\n            animated: true\n        })';
  const animRepl = 'const resizeFileTo = async (file, options, { name, hash })=>{\n    const isGif = file.mime === \'image/gif\' || file.ext === \'.gif\';\n    const filePath = file.tmpWorkingDirectory ? path.join(file.tmpWorkingDirectory, hash) : hash;\n    let newInfo;\n    if (!file.filepath) {\n        const transform = sharp__default.default({\n            animated: !isGif\n        })';
  if (uploadContent.includes(animTarget)) {
    uploadContent = uploadContent.replace(animTarget, animRepl);
  }

  const animFileTarget = 'newInfo = await sharp__default.default(file.filepath, {\n            animated: true\n        }).resize(options).toFile(filePath);';
  const animFileRepl = 'newInfo = await sharp__default.default(file.filepath, {\n            animated: !isGif\n        }).resize(options).toFile(filePath);';
  if (uploadContent.includes(animFileTarget)) {
    uploadContent = uploadContent.replace(animFileTarget, animFileRepl);
    console.log('[patch-page-builder] Patched fast GIF thumbnail in', uploadServiceFile);
  }

  fs.writeFileSync(uploadServiceFile, uploadContent, 'utf8');
}
