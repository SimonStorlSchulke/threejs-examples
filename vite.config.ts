import { defineConfig } from 'vite';

export default defineConfig({
  base: '/threejs-examples',
  build: {
    outDir: 'docs',
  },
  resolve: {
    alias: {
      src: "/src",
    },
  },
})
