"use client";

import Image from "next/image";
import type { SavedPoemEntry } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

interface SavedPoemDisplayCardProps {
  poemEntry: SavedPoemEntry;
  onDelete: (id: string) => void;
}

export function SavedPoemDisplayCard({ poemEntry, onDelete }: SavedPoemDisplayCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-3 flex flex-col flex-grow">
        <div className="aspect-[4/3] rounded-md overflow-hidden relative bg-muted border border-border">
          <Image
            src={poemEntry.imageDataUrl}
            alt="Saved visual inspiration"
            layout="fill"
            objectFit="cover"
            data-ai-hint="poem visual"
          />
        </div>
        <ScrollArea className="h-40 flex-grow rounded-md bg-secondary/30 border border-border">
          <div className="p-3 text-sm whitespace-pre-wrap text-secondary-foreground leading-relaxed">
            {poemEntry.poemText}
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center pt-2">
          <p className="text-xs text-muted-foreground">
            {new Date(poemEntry.createdAt).toLocaleDateString()}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(poemEntry.id)}
            aria-label="Delete poem"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
