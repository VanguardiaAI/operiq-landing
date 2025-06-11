import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    // Cargar variables de entorno basadas en el modo (development, production, etc)
    var env = loadEnv(mode, process.cwd(), '');
    console.log('Variables de entorno cargadas en Vite:');
    console.log('- VITE_API_URL:', env.VITE_API_URL);
    console.log('- VITE_STRIPE_PUBLISHABLE_KEY:', env.VITE_STRIPE_PUBLISHABLE_KEY ?
        "".concat(env.VITE_STRIPE_PUBLISHABLE_KEY.substring(0, 10), "...").concat(env.VITE_STRIPE_PUBLISHABLE_KEY.substring(env.VITE_STRIPE_PUBLISHABLE_KEY.length - 4)) : 'no definida');
    console.log('- VITE_GOOGLE_MAPS_API_KEY:', env.VITE_GOOGLE_MAPS_API_KEY ?
        "".concat(env.VITE_GOOGLE_MAPS_API_KEY.substring(0, 10), "...").concat(env.VITE_GOOGLE_MAPS_API_KEY.substring(env.VITE_GOOGLE_MAPS_API_KEY.length - 4)) : 'no definida');
    return {
        define: {
            // Hacer que las variables de entorno estén disponibles en el código
            'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
            'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
            'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
            // Agregar compatibilidad con entornos que usan process.env
            'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
            'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
            'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            proxy: {
                '/api': 'http://localhost:5000'
            }
        },
        build: {
            chunkSizeWarningLimit: 600
        }
    };
});
