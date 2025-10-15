import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Your Vite configuration options
    root: 'src', // Set the root to src directory

    build: {
      outDir: '../dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
          favourite: resolve(__dirname, 'src/pages/favourite.html'),
        },
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV), // Example of using a non-VITE_ prefixed variable
    },
  };
});
