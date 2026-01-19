"use client";

import { useState } from "react";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import Image from "next/image";

export default function Home() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (imageData: string, prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, prompt }),
      });
      const data = await response.json();
      if (data.image) {
        setGeneratedImage(data.image);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-zinc-50 grid grid-cols-1 md:grid-cols-2">
      <div className="h-full border-r border-zinc-200 flex flex-col">
        <div className="p-4 border-b border-zinc-200">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Draw</span>
        </div>
        <div className="flex-1">
          <DrawingCanvas onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>

      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-zinc-200">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Result</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-sm text-zinc-400">Generating...</span>
            </div>
          ) : generatedImage ? (
            <div className="w-full max-w-md aspect-square relative rounded-lg overflow-hidden border border-zinc-200">
              <Image
                src={generatedImage}
                alt="Generated image"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400">Your generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
