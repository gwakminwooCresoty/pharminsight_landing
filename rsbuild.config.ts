import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: {
    title: '약국 프랜차이즈 본부를 위한 팜넥서스',
  },
  plugins: [pluginReact()],
});
