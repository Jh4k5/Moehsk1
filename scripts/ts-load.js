// Loads .ts data modules directly by transpiling them on require.
const ts = require('typescript');
const path = require('path');
const fs = require('fs');
const Module = require('module');

const ROOT = path.resolve(__dirname, '..');

require.extensions['.ts'] = function (mod, filename) {
  const src = fs.readFileSync(filename, 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: filename,
  }).outputText;
  mod._compile(out, filename);
};

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) {
    request = path.join(ROOT, 'src', request.slice(2));
  }
  try {
    return origResolve.call(this, request, ...rest);
  } catch (e) {
    for (const ext of ['.ts', '.tsx']) {
      try { return origResolve.call(this, request + ext, ...rest); } catch {}
    }
    throw e;
  }
};

module.exports = { ROOT, load: (rel) => require(path.join(ROOT, rel)) };
