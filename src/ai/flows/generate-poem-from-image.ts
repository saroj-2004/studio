// Implemented the Genkit flow for generating poems from uploaded images.

'use server';

/**
 * @fileOverview Generates a poem inspired by the content and mood of an image.
 *
 * - generatePoemFromImage - A function that generates a poem from an image.
 * - GeneratePoemFromImageInput - The input type for the generatePoemFromImage function.
 * - GeneratePoemFromImageOutput - The return type for the generatePoemFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePoemFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate a poem from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePoemFromImageInput = z.infer<typeof GeneratePoemFromImageInputSchema>;

const GeneratePoemFromImageOutputSchema = z.object({
  poem: z.string().describe('A poem generated based on the image content and mood.'),
});
export type GeneratePoemFromImageOutput = z.infer<typeof GeneratePoemFromImageOutputSchema>;

export async function generatePoemFromImage(input: GeneratePoemFromImageInput): Promise<GeneratePoemFromImageOutput> {
  return generatePoemFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoemFromImagePrompt',
  input: {schema: GeneratePoemFromImageInputSchema},
  output: {schema: GeneratePoemFromImageOutputSchema},
  prompt: `You are a poet, skilled at writing poems based on images.

  Please analyze the image provided and write a poem that reflects its content and mood.

  Image: {{media url=photoDataUri}}

  Poem:`,
});

const generatePoemFromImageFlow = ai.defineFlow(
  {
    name: 'generatePoemFromImageFlow',
    inputSchema: GeneratePoemFromImageInputSchema,
    outputSchema: GeneratePoemFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
