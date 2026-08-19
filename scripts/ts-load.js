// Loads .ts data modules directly by transpiling them on require.
const ts = require('typescript');
const path = require('path');
const fs = require('fs');
const Module = require('module');

const ROOT = path.resolve(__dirname, '..');

// `server-only` is a package whose whole job is to throw when it is loaded
// anywhere but a React Server Component. These scripts ARE the server — they
// run in node, offline, against the data modules — so the guard has nothing to
// protect here and would only stop the checks from running at all. Stubbed to a
// no-op for the loader; the real module still guards the application build,
// which is where it matters.
const originalResolve = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  if (request === 'server-only') return require.resolve('./_noop.js')
  return originalResolve.call(this, request, ...rest)
}

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
