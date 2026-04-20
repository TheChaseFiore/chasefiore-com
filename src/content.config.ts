import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const portfolioCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date().optional(),
    coverImage: image().optional(),
    model: z.string().optional(), // path to GLB in public/, e.g. "/models/my-project.glb"
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  'portfolio': portfolioCollection,
};
