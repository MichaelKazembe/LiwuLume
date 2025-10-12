import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Your Vite configuration options
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV), // Example of using a non-VITE_ prefixed variable
    },
  };
});
