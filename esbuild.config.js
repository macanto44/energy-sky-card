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
