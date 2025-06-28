"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { generatePoemFromImage } from "@/ai/flows/generate-poem-from-image";
import type { SavedPoemEntry } from "@/types";
import { SavedPoemDisplayCard } from "@/components/SavedPoemDisplayCard";
import { UploadCloud, Loader2, Save, Share2, Image as ImageIcon } from "lucide-react";

const LOCAL_STORAGE_KEY = "poemvision_saved_poems_nepali";

export default function PoemVisionPage() {
  const [uploadedImageDataUri, setUploadedImageDataUri] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [generatedPoem, setGeneratedPoem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedPoems, setSavedPoems] = useState<SavedPoemEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedPoems = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPoems) {
        setSavedPoems(JSON.parse(storedPoems));
      }
    } catch (error) {
      console.error("Failed to load saved poems from localStorage:", error);
      toast({
        title: "Error",
        description: "Could not load saved poems.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Limit file size to 4MB
        toast({
          title: "Image too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }
      setIsLoading(true);
      setGeneratedPoem(null); // Reset poem when new image is selected

      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setUploadedImageDataUri(dataUri);
        setUploadedImagePreview(dataUri); // For display

        try {
          const result = await generatePoemFromImage({ photoDataUri: dataUri });
          if (result.poem) {
            setGeneratedPoem(result.poem);
            toast({
              title: "Poem Generated!",
              description: "Your poetic vision has arrived.",
            });
          } else {
            throw new Error("AI did not return a poem.");
          }
        } catch (error) {
          console.error("Error generating poem:", error);
          toast({
            title: "Generation Failed",
            description: "Could not generate a poem. Please try another image or check your connection.",
            variant: "destructive",
          });
          setGeneratedPoem("Failed to generate poem. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast({
            title: "File Read Error",
            description: "Could not read the image file.",
            variant: "destructive",
        });
        setIsLoading(false);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleSavePoem = useCallback(() => {
    if (generatedPoem && uploadedImageDataUri) {
      const newPoemEntry: SavedPoemEntry = {
        id: Date.now().toString(),
        imageDataUrl: uploadedImageDataUri,
        poemText: generatedPoem,
        createdAt: new Date().toISOString(),
      };
      const updatedPoems = [newPoemEntry, ...savedPoems];
      setSavedPoems(updatedPoems);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPoems));
        toast({
          title: "Poem Saved",
          description: "Your masterpiece is now in your collection.",
        });
      } catch (error) {
        console.error("Failed to save poem to localStorage:", error);
        toast({
            title: "Save Error",
            description: "Could not save poem due to storage limitations.",
            variant: "destructive",
        });
        // Rollback state if localStorage fails
        setSavedPoems(savedPoems);
      }
    }
  }, [generatedPoem, uploadedImageDataUri, savedPoems, toast]);

  const handleDeletePoem = useCallback((id: string) => {
    const updatedPoems = savedPoems.filter(p => p.id !== id);
    setSavedPoems(updatedPoems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPoems));
    toast({
      title: "Poem Deleted",
      description: "It has been removed from your collection.",
    });
  }, [savedPoems, toast]);

  const handleSharePoem = useCallback(async () => {
    if (generatedPoem && uploadedImagePreview) {
      const shareText = `A Nepali poem created for my image:\n\n${generatedPoem}`;
      if (navigator.share) {
        try {
          // Fetch the image as a blob to share it
          const response = await fetch(uploadedImagePreview);
          const blob = await response.blob();
          const file = new File([blob], "poem-image.png", { type: blob.type });

          await navigator.share({
            title: "Nepali Poem",
            text: shareText,
            files: [file],
          });
          toast({ title: "Shared!", description: "Your poem is on its way." });
        } catch (error) {
          console.error("Error sharing:", error);
          // Fallback to text copy if sharing files fails or is not fully supported
          navigator.clipboard.writeText(shareText);
          toast({ title: "Copied to Clipboard", description: "Poem text ready to paste." });
        }
      } else {
        navigator.clipboard.writeText(shareText);
        toast({ title: "Copied to Clipboard", description: "Poem text ready to paste." });
      }
    }
  }, [generatedPoem, uploadedImagePreview, toast]);

  return (
    <div className="min-h-screen p-4 sm:p-8 selection:bg-primary/30 selection:text-primary-foreground">
      <header className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-headline text-secondary-foreground tracking-tight">Nepali Poem Generator</h1>
        <p className="text-lg text-muted-foreground mt-2">Transform your photos into Nepali poetry.</p>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        <Card className="shadow-xl overflow-hidden">
          <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-6 md:gap-8 items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-headline text-primary">Upload Your Image</h2>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/80 file:text-primary-foreground hover:file:bg-primary"
              />
              <div className="mt-4 rounded-lg overflow-hidden border border-border aspect-square relative bg-card flex items-center justify-center">
                {uploadedImagePreview ? (
                  <Image src={uploadedImagePreview} alt="Uploaded inspiration" layout="fill" objectFit="contain" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <UploadCloud size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Your image will appear here.</p>
                    <p className="text-xs mt-1">Max 4MB.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-headline text-primary">Generated Nepali Poem</h2>
              <div className="bg-card border border-border rounded-lg p-1 min-h-[calc(16rem+theme(spacing.8))] aspect-square flex flex-col"> {/* Matched height of image container approx */}
                {isLoading ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                    <Loader2 size={40} className="animate-spin text-primary mb-3" />
                    <p className="text-muted-foreground font-medium">Crafting your Nepali poem...</p>
                    <p className="text-sm text-muted-foreground">This may take a moment.</p>
                  </div>
                ) : generatedPoem ? (
                  <ScrollArea className="flex-grow h-full">
                    <div className="p-4 whitespace-pre-wrap font-body text-foreground leading-relaxed">
                      {generatedPoem}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {uploadedImagePreview ? "Your poem will appear here." : "Upload an image to inspire a poem."}
                    </p>
                  </div>
                )}
              </div>
               <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button onClick={handleSavePoem} disabled={isLoading || !generatedPoem || !uploadedImageDataUri} className="w-full sm:w-auto">
                  <Save size={18} className="mr-2" /> Save Poem
                </Button>
                <Button variant="outline" onClick={handleSharePoem} disabled={isLoading || !generatedPoem} className="w-full sm:w-auto">
                  <Share2 size={18} className="mr-2" /> Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {savedPoems.length > 0 && (
          <section className="pt-8">
            <h2 className="text-3xl font-headline text-secondary-foreground mb-6 text-center">Your Saved Nepali Poems</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPoems.map(poem => (
                <SavedPoemDisplayCard key={poem.id} poemEntry={poem} onDelete={handleDeletePoem} />
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="text-center py-12 mt-12 border-t border-border">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Nepali Poem Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}
