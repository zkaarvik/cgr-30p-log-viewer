import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      fallback: "plaintext",
      routes: {
        include: ["/*"],
        exclude: ["<all>"],
      },
    }),
  },
  paths: {
    base: process.argv.includes("dev") ? "" : process.env.BASE_PATH,
  },
};

export default config;
