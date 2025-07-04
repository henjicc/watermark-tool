import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 移除对lucide-react的排除，以避免图标文件被广告拦截器阻止
  // optimizeDeps: {
  //   exclude: ['lucide-react'],
  // },
});
