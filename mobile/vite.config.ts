import { defineConfig } from 'vite';
import { RollupDynamicImportVarsOptions } from 'vite';
const isProduction = process.env['NODE_ENV'] === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    cssCodeSplit: false,
    emptyOutDir: false,
    lib: {
      name: 'mobile',
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['iife'],
    },
    rollupOptions: {
      external: ['playcanvas'],
      output: {
        globals: {
          playcanvas: 'pc',
        }
      }
    },
    outDir: 'playcanvas/scripts',
  },
  define: {
    GC_PRODUCTION: isProduction,
    BUILD_NUM: JSON.stringify(process.env.CIRCLE_BUILD_NUM),
    BRANCH: JSON.stringify(process.env.CIRCLE_BRANCH || 'develop'),
  },
});
