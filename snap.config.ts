import type { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  input: 'src/index.tsx',
  server: { port: 8099 },
  stats: { verbose: true },
};

export default config;
