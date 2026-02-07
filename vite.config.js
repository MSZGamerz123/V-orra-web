import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                nohorn: resolve(__dirname, 'no-horn-zone.html'),
                smartbeam: resolve(__dirname, 'smart-beam.html'),
                immobilization: resolve(__dirname, 'passive-immobilization.html'),
                products: resolve(__dirname, 'products.html'),
                dashboard: resolve(__dirname, 'dashboard.html'),
                founders: resolve(__dirname, 'founders.html')
            }
        },
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        host: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@styles': resolve(__dirname, 'styles'),
            '@assets': resolve(__dirname, 'assets')
        }
    },
    css: {
        devSourcemap: true
    },
    optimizeDeps: {
        include: ['three', 'gsap', '@studio-freight/lenis']
    }
});
