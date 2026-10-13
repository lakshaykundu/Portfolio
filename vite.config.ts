import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Link previews need absolute URLs. On Vercel, VERCEL_PROJECT_PRODUCTION_URL is the production
 * domain (custom domain if one is set), available at build time.
 */
function siteUrl(): Plugin {
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url = domain ? `https://${domain}` : 'http://localhost:5173'
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
})
