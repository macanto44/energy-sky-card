// Builds the card and its editor into two self-contained scripts at the repository root.
//   node esbuild.config.js           one build
//   node esbuild.config.js --watch   rebuild on change
const esbuild = require('esbuild');
const { readFileSync } = require('fs');
const { version } = require('./package.json');

// The file names follow CARD_NAME in src/constants.ts, the one place the name is set
const match = readFileSync('src/constants.ts', 'utf8').match(/export const CARD_NAME = '([a-z0-9-]+)'/);
if (!match) throw new Error('src/constants.ts: CARD_NAME not found');
const name = match[1];

/**
 * The card's stylesheet is a template string, which esbuild doesn't minify:
 * drop its comments and indentation (they explain the CSS in the source,
 * they needn't ship). Only in src/styles/card.ts, from CARD_CSS on.
 */
const cssComments = {
  name: 'card-css',
  setup(build) {
    build.onLoad({ filter: /src[\\/]styles[\\/]card\.ts$/ }, args => {
      const source = readFileSync(args.path, 'utf8');
      const at = source.indexOf('export const CARD_CSS = `');
      if (at < 0) throw new Error('src/styles/card.ts: CARD_CSS not found');
      const css = source.slice(at).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s+/g, '\n');
      return { contents: source.slice(0, at) + css, loader: 'ts' };
    });
  },
};

const builds = [
  ['src/energy-sky-card.ts', `${name}.js`],
  ['src/energy-sky-card-editor.ts', `${name}-editor.js`],
].map(([entry, outfile]) => ({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  legalComments: 'eof',
  define: { __VERSION__: JSON.stringify(version) },
  plugins: [cssComments],
}));

async function main() {
  if (process.argv.includes('--watch')) {
    for (const options of builds) await (await esbuild.context(options)).watch();
    console.log('esbuild: watching');
    return;
  }
  await Promise.all(builds.map(options => esbuild.build(options)));
  console.log(`esbuild: ${builds.map(b => b.outfile).join(', ')} (v${version})`);
}

main().catch(() => process.exit(1));
