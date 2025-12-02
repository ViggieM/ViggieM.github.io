import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	...astro.configs.recommended,
	...astro.configs["jsx-a11y-recommended"],
	{
		files: ["**/*.astro"],
		languageOptions: {
			parser: astro.parser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: [".astro"],
			},
		},
		rules: {
			// Disable 'no-undef' for Astro files as it conflicts with Astro's scoping
			"no-undef": "off",
		},
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
	},
	{
		ignores: ["dist/**", ".astro/**", "node_modules/**"],
	},
];
