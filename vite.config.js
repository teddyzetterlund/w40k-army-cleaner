import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages
  base: './',
  
  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for debugging
    sourcemap: true,
    
    // Rollup options for better PWA support
    rollupOptions: {
      output: {
        // Generate hashed filenames for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    
    // Ensure assets are properly handled
    assetsInlineLimit: 4096,
    
    // Minify for production
    minify: 'terser',
    
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.warn and console.error
        drop_debugger: true
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: []
  },
  
  // Handle PWA assets
  publicDir: 'public',
  
  // Ensure proper handling of service worker
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.1.0')
  }
}); 