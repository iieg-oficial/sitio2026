import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, __dirname, '');

    const apiProxyTarget = env.VITE_API_PROXY_TARGET ?? 'http://localhost:18000';
    const ckanProxyTarget = env.VITE_CKAN_PROXY_TARGET ?? 'http://localhost:15000';

    const ckanProxy = {
        target: ckanProxyTarget,
        changeOrigin: true,
    };

    return {
        plugins: [react()],
        root: '.',
        server: {
            host: env.VITE_WEB_HOST ?? '0.0.0.0',
            port: Number(env.VITE_WEB_PORT ?? '3010'),
            strictPort: true,
            proxy: {
                '/datos-abiertos': {
                    ...ckanProxy,
                    rewrite: (path) => path.replace(/^\/datos-abiertos/, '') || '/',
                },
                '/dataset': ckanProxy,
                '/organization': ckanProxy,
                '/group': ckanProxy,
                '/tag': ckanProxy,
                '/harvest': ckanProxy,
                '/user': ckanProxy,
                '/base': ckanProxy,
                '/webassets': ckanProxy,
                '/fanstatic': ckanProxy,
                '/storage': ckanProxy,
                '/uploads': ckanProxy,
                '/api/3': ckanProxy,
                '/api': {
                    target: apiProxyTarget,
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
