import { defineConfig } from 'vite';
import { default as dts } from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      staticImport: true,
      entryRoot: 'src',
      logLevel: 'error'
    })
  ],
  appType: 'custom',
  build: {
    minify: false,
    sourcemap: false,
    outDir: 'lib',
    emptyOutDir: true,
    lib: {
      entry: {
        'index': 'src/index.ts',
        'react': 'src/react/index.ts',
        'react-shim': 'src/react-shim/index.ts'
      },
      name: 'usable-atom',
      fileName(format, name) {
        return `${name}.${format === 'es' ? 'mjs' : 'js'}`;
      },
      formats: ['es', 'cjs']
    },
    target: [
      'es6'
    ],
    rollupOptions: {
      output: {
        interop: 'compat'
      },
      external: [
        'react',
        'use-sync-external-store',
        'use-sync-external-store/shim'
      ]
    }
  },
  esbuild: {
    charset: 'utf8'
  }
});
