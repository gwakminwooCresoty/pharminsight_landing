import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: {
    title: '당신의 약국을 위한 팜인사이트',
  },
  plugins: [pluginReact()],
});
