// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

import expressiveCode from "astro-expressive-code";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://viggie.dev",

	vite: {
		plugins: [tailwindcss()],
	},

	markdown: {
		shikiConfig: {
			theme: "github-light",
		},
	},

	integrations: [expressiveCode(), mdx(), sitemap()],
});
