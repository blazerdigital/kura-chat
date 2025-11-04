import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Explicitly define build-time env substitution for Kura API base.
// This ensures that even if Netlify or Render misses the variable injection,
// the HTTPS value is hard-baked into the compiled bundle.
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_KURA_API_BASE': JSON.stringify(
      process.env.VITE_KURA_API_BASE || 'https://api.blazerdigital.com'
    ),
  },
});
