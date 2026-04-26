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
    cameraPos: z.tuple([z.number(), z.number(), z.number()]).optional(),
    cameraTgt: z.tuple([z.number(), z.number(), z.number()]).optional(),
    tags: z.array(z.string()).optional(),
    youtubeId: z.string().optional(),
    youtubeStart: z.number().optional(),
    initialCutZ: z.number().optional(),
  }),
});

const lightingDesignCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/personal_projects/lighting-design" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date().optional(),
    coverImage: image().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const drawingCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/personal_projects/drawing" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date().optional(),
    coverImage: image().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const programingCollection = defineCollection({
  loader: glob({ pattern: "*/index.md", base: "./src/content/personal_projects/programing" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date().optional(),
    coverImage: image().optional(),
    tags: z.array(z.string()).optional(),
    youtubeId: z.string().optional(),
    youtubeStart: z.number().optional(),
    githubRepo: z.string().optional(),
  }),
});

export const collections = {
  'portfolio': portfolioCollection,
  'lighting-design': lightingDesignCollection,
  'drawing': drawingCollection,
  'programing': programingCollection,
};
