import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { CSP_POLICY, buildCSPString } from "./config/csp.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, __dirname, '');

    return {
        plugins: [react(),
            {
                name: "inject-csp-meta",
                transformIndexHtml(html) {
                    const csp = buildCSPString(CSP_POLICY);
                    return html.replace(
                    "%CSP_CONTENT%",
                    csp
                    );
                },
            },
        ],
        root: '.',
        server: {
            host: env.VITE_WEB_HOST ?? '0.0.0.0',
            port: Number(env.VITE_WEB_PORT ?? '3010'),
            strictPort: true,
            proxy: {
                '/datos-abiertos': {
                    target: 'http://ckan:5000',
                    changeOrigin: true,
                    rewrite: (path) => {
                        const rewritten = path.replace(/^\/datos-abiertos(?=\/|$)/, '');
                        return rewritten || '/';
                    },
                    headers: {
                        'X-Script-Name': '/datos-abiertos',
                        'X-Forwarded-Prefix': '/datos-abiertos',
                    }
                },
                '/api': {
                    target: 'http://api:8000',
                    changeOrigin: true,
                },
            },
            watch: {
                usePolling: true
            }
        },
        build: {
            outDir: 'dist',
            sourcemap: true
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@components': path.resolve(__dirname, './src/components'),
                '@pages': path.resolve(__dirname, './src/pages'),
                '@layouts': path.resolve(__dirname, './src/layouts'),
                '@providers': path.resolve(__dirname, './src/providers'),
                '@assets': path.resolve(__dirname, './src/assets'),
                '@utils': path.resolve(__dirname, './src/utils'),
                '@hooks': path.resolve(__dirname, './src/hooks'),
                '@services': path.resolve(__dirname, './src/services'),
                '@contexts': path.resolve(__dirname, './src/contexts')
            },
        },
    };
});