import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        open: false,
    },
    build: {
        rollupOptions: {
            output: {
                // Split heavy vendor code into its own cacheable chunks so the main
                // app bundle (and startup parse) is smaller.
                manualChunks: {
                    firebase: [
                        'firebase/app',
                        'firebase/auth',
                        'firebase/firestore',
                    ],
                    react: ['react', 'react-dom'],
                },
            },
        },
    },
});
