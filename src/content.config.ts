import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const portfolioCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
  
  // 1. We added ({ image }) back in here
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date().optional(),
    
    // 2. We changed this back to image()
    coverImage: image().optional(), 
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  'portfolio': portfolioCollection,
};