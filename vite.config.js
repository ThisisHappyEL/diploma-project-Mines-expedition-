import { defineConfig } from 'vite';

export default defineConfig({
  // Точное имя вашего репозитория
  base: '/diploma-project-Mines-expedition-/', 
  
  server: {
    watch: {
      usePolling: true,
      interval: 200
    }
  }
});