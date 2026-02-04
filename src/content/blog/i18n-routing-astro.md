---
title: "Multilingual Routing System for Astro"
ogDescription: "An implementation of a i18n routing system for Astro, with translated URLs"
publishedDate: 2025-11-18
---

## Introduction

When building a multilingual website, you face two challenges: translating your content _and_ translating your URLs. While most developers focus on the first (storing translations, switching languages), the second is often overlooked. Yet having URLs like `/articles` and `/de/artikel` instead of `/de/articles` creates a more native experience for users and better SEO.

This guide explains how to build a routing architecture for an Astro project with static pages and dynamic content collections that supports:

- Fully translated URLs (`/about` → `/de/ueber-mich`)
- Language switching that preserves context
- Clean separation between framework features and custom logic

We'll explore the **architecture and patterns**, and not go to deep into the code implementation. Think of this as a blueprint rather than a copy and paste.

## What is Astro?

Astro is a modern web framework built specifically for content-focused websites. Unlike traditional JavaScript frameworks that hydrate entire pages with JavaScript, Astro takes a refreshingly different approach: it ships **zero JavaScript by default** and renders everything as static HTML. This "Island Architecture" means your blog posts, marketing pages, and documentation remain pure HTML, while only truly interactive components (like image carousels or comment sections) load JavaScript. The result? Sites that are significantly faster with drastically less JavaScript compared to traditional React or even SvelteKit applications.

When compared to React-based frameworks like Next.js, Astro excels at content-first websites where performance and SEO are critical. Next.js is excellent for complex, scalable applications with heavy client-side interactivity, but for blogs, portfolios, and marketing sites, Astro wins decisively. Against SvelteKit, Astro offers similar simplicity and developer experience but with a unique advantage: **framework agnosticism**. You can mix React, Vue, Svelte, and other frameworks in a single project—use React for a complex form, Vue for charts, and keep everything else vanilla Astro.

What makes Astro a [developer's dream](https://websmith.studio/blog/astro-is-a-developers-dream/) is how it "makes the right thing the easy thing." TypeScript works out of the box, images optimize automatically, and hot module replacement just works. There's no need to wrestle with hooks, state management, or lifecycle methods unless you explicitly want client-side interactivity. This philosophy of **transparency and simplicity** extends to Astro's i18n approach too—as we'll see, Astro prefers explicit, debuggable patterns over "magic" utilities that hide complexity.

## How does Astro support internationalisation?

Astro provides built-in i18n support through a simple configuration in `astro.config.mjs`. By defining an `i18n` object with your supported locales, Astro automatically activates internationalization features:

```js
// astro.config.mjs
export default defineConfig({
	i18n: {
		defaultLocale: "en",
		locales: ["en", "de"],
		routing: {
			prefixDefaultLocale: false, // English URLs will have no /en/ prefix
		},
	},
});
```

This minimal configuration triggers Astro to inject middleware that computes the current locale from the URL and makes it available as [`Astro.currentLocale`](https://docs.astro.build/en/reference/api-reference/#currentlocale) in every component. No custom middleware needed—Astro handles the routing logic for you.

[Astro's official documentation](https://docs.astro.build/en/guides/internationalization/) recommends duplicating pages per language rather than using dynamic "magic routing" solutions. While this means more files (not following the DRY principle), it aligns with Astro's core philosophy: **file paths should directly map to URL paths**. This transparency and simplicity is more valuable than code reduction, especially as your site grows. The explicit structure makes debugging easier and keeps your routing logic visible rather than hidden behind complex utilities.

This leads to an organisation of our files like this:

```
/src/pages/
├── index.astro              → /
├── about.astro              → /about
├── articles/
│   ├── index.astro          → /articles
│   └── [...slug].astro      → /articles/getting-started
└── de/
    ├── index.astro          → /de/
    ├── ueber-mich.astro     → /de/ueber-mich
    └── artikel/
        ├── index.astro      → /de/artikel
        └── [...slug].astro  → /de/artikel/erste-schritte
```

The content is organized into language-specific subdirectories within collections:

```
/src/content/
├── config.ts              → Collection schema
└── articles/
    ├── en/
    │   ├── getting-started.md
    │   └── second-post.md
    └── de/
        ├── erste-schritte.md
        └── zweiter-beitrag.md
```

The `config.ts` file defines the articles collection schema with fields for `title`, `description`, `publishedDate`, and importantly, `alternateId` — which links translated versions of the same article together.

Notice two patterns:

1. **Static pages are duplicated** per language (about.astro vs ueber-mich.astro)
2. **Dynamic routes are duplicated** per language (`articles/` vs `artikel/`)

## How to translate paths

The core of URL translation should be encapsulated in a single function, `switchLanguageUrl()`. It takes a URL and target language, then returns the translated URL by looking up route mappings:

```js
// Input: current URL + target language
switchLanguageUrl("/de/artikel/erste-schritte", "en");
// 1. Extract slug: "artikel/erste-schritte"
// 2. Lookup: routes.de["artikel/erste-schritte"] → "articles/getting-started"
// 3. Output: "/articles/getting-started"

switchLanguageUrl("/about", "de");
// Output: "/de/ueber-mich"

switchLanguageUrl("/articles/no-translation", "de");
// Output: undefined (translation doesn't exist)
```

This way it can be used in components to get the URL in a specific language:

```astro
---
// LanguageSwitch.astro
const url = Astro.url.pathname;
const enUrl = switchLanguageUrl(url, "en");
const deUrl = switchLanguageUrl(url, "de");
---

<a href={enUrl}>EN</a>
<!-- or disabled if undefined -->
<a href={deUrl}>DE</a>
```

The function returns `undefined` when no translation exists, allowing components to disable or hide unavailable language options.

<todo>
    The [Astro docs](https://docs.astro.build/en/recipes/i18n/#translate-ui-strings) recommend centralizing UI translations in a single file (e.g., `src/i18n/ui.ts`) that you import into components.
</todo>

### Generate a sitemap for translated URLs

While Astro provides an official `@astrojs/sitemap` integration, it falls short for sites with translated URLs. The integration works by crawling the built output directory, which means it sees `/articles/getting-started` and `/de/artikel/erste-schritte` as completely separate pages with no relationship. This makes it impossible to generate the SEO-critical `<xhtml:link rel="alternate" hreflang="...">` tags that tell search engines these pages are translations of each other. Additionally, it can't access content frontmatter for accurate per-page `lastmod` timestamps.

The solution, [inspired by this article](https://amxmln.com/blog/2023/creating-custom-sitemaps-in-astro/), is a custom sitemap endpoint at `src/pages/sitemap.xml.ts` that exports a `GET()` function returning XML:

```ts
export const GET: APIRoute = async ({ site }) => {
	// 1. Manually list static pages
	const staticPages = ["", "about", "articles", "impressum", "privacy", "contact"];

	// 2. Fetch articles by language
	const articlesEN = await getCollection("articles", ({ id }) => id.startsWith("en/"));
	const articlesDE = await getCollection("articles", ({ id }) => id.startsWith("de/"));

	const allRoutes: Route[] = [];

	// 3. Build routes for static pages
	for (const slug of staticPages) {
		const entry = {
			url: `/${slug}`,
			lang: "en",
			lastMod: new Date(),
			alternateVersions: {},
		};

		// Find German translation using switchLanguageUrl
		const urlDe = switchLanguageUrl(entry.url, "de");
		if (urlDe) {
			entry.alternateVersions = { de: urlDe, en: entry.url };
		}
		allRoutes.push(entry);
	}

	// 4. Build routes for English articles
	for (const article of articlesEN) {
		const entry = {
			url: `/articles/${article.slug.replace("en/", "")}`,
			lang: "en",
			lastMod: new Date(article.data.publishedDate),
			alternateVersions: {},
		};
		const urlDe = switchLanguageUrl(entry.url, "de");
		if (urlDe) entry.alternateVersions = { de: urlDe, en: entry.url };
		allRoutes.push(entry);
	}

	// 5. Build routes for German articles (similar pattern)
	// ...

	// 6. Generate XML with xhtml:link alternate tags
	const sitemapItems = allRoutes.map((route) => ({
		url: [
			{ loc: new URL(route.url, site).href },
			{ lastmod: route.lastMod.toISOString().split("T")[0] },
			{ changefreq: "weekly" },
			// Add x-default and language alternates
			...Object.entries(route.alternateVersions).map(([lang, url]) => ({
				"xhtml:link": {
					_attr: { rel: "alternate", hreflang: lang, href: new URL(url, site).href },
				},
			})),
		],
	}));

	return new Response(xml(sitemapObject), {
		headers: { "Content-Type": "application/xml" },
	});
};
```

While this works well, the process remains manual—the static page array must be updated when routes change, and URL construction logic is duplicated across the three loops. This could be improved by auto-discovering pages through filesystem scanning, leveraging the existing `routes.ts` mapping, and centralizing URL construction into shared utilities that both the routing system and sitemap generation can use.

## What are other approaches for i18n?

An alternative approach, [detailed by BitDoze](https://www.bitdoze.com/astro-i18n-localization/), uses **dynamic routing with `getStaticPaths()`** instead of duplicating page files. Rather than creating `about.astro` and `de/ueber-mich.astro`, you create a single `[...about].astro` file that generates both (or multiple) language versions at build time.

```
/src/pages/
├── [...about].astro          → generates /about, /ueber-mich
├── [...articles].astro       → generates /articles, /de/artikel
├── [...articleSlug].astro    → generates /articles/{slugEN}, /de/artikel/{slugDE}
└── [...index].astro          → generates /, /de
```

The main **tradeoff** is reduced file duplication versus reduced routing transparency. The dynamic approach means fewer files to maintain and centralized route mappings. The duplicated-page approach creates more files but maintains Astro's core philosophy that file paths should directly mirror URL paths, making the routing system immediately debuggable by looking at the file tree.
