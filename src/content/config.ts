// /src/content/config.ts

import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		ogDescription: z.string(),
		publishedDate: z.date(),
	}),
});

export const collections = {
	blog: blogCollection,
};
