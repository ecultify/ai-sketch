"use client";

import { useState } from "react";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import Image from "next/image";

export default function Home() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [originalSketch, setOriginalSketch] = useState<string | null>(null);
  const [imagination, setImagination] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (imageData: string, prompt: string, imaginationLevel: number) => {
    setIsLoading(true);
    setOriginalSketch(imageData); // Store the original sketch
    setImagination(imaginationLevel); // Store imagination level
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, prompt, imagination: imaginationLevel }),
      });
      const data = await response.json();
      if (data.error) {
        console.error("Generation error:", data.error);
        alert(`Error: ${data.error}`);
      } else if (data.image) {
        setGeneratedImage(data.image);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setGeneratedImage(null);
    setOriginalSketch(null);
  };

  // Calculate which image to display based on imagination level
  const getDisplayImage = () => {
    if (!originalSketch) return null;
    if (imagination === 0) return originalSketch; // Show exact doodle only at 0%
    if (!generatedImage) return originalSketch; // If AI hasn't generated yet, show doodle
    return generatedImage; // Show AI image for any value > 0
  };

  const displayImage = getDisplayImage();

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex flex-col">
      {/* Header with Logo */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo-ecultify.png.webp" 
            alt="Ecultify" 
            width={120} 
            height={40}
            className="h-10 w-auto"
            priority
          />
          <div className="h-6 w-px bg-zinc-300"></div>
          <h1 className="text-lg font-semibold text-zinc-800">AI Sketch to Anime</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="h-full border-r border-zinc-200 flex flex-col bg-white/50 backdrop-blur-sm">
          <div className="p-4 border-b border-zinc-200 bg-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-sm font-semibold text-zinc-700">Sketch Canvas</span>
            </div>
          </div>
        <div className="flex-1">
          <DrawingCanvas 
            onGenerate={handleGenerate} 
            onClear={handleClear}
            onImaginationChange={setImagination}
            isGenerating={isLoading} 
            autoGenerate={false} 
          />
        </div>
      </div>

      <div className="h-full flex flex-col bg-white/50 backdrop-blur-sm">
        <div className="p-4 border-b border-zinc-200 bg-white/80">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-zinc-700">Anime Result</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 relative">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              {generatedImage && (
                <div className="w-full max-w-md aspect-square relative rounded-lg overflow-hidden border border-zinc-200 opacity-50">
                  <img
                    src={generatedImage}
                    alt="Previous generation"
                    className="w-full h-full object-contain blur-sm"
                  />
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-50/80 backdrop-blur-sm">
                <div className="w-12 h-12 border-3 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                <span className="text-sm font-medium text-zinc-600">Transforming to anime style...</span>
                <span className="text-xs text-zinc-400">This may take 5-15 seconds</span>
              </div>
            </div>
          ) : displayImage ? (
            <div className="w-full max-w-md aspect-square relative rounded-lg overflow-hidden border border-zinc-200 shadow-lg transition-all duration-300 hover:shadow-xl bg-white">
              <img
                src={displayImage}
                alt={imagination === 0 ? "Your doodle" : "Generated anime image"}
                className="w-full h-full object-contain animate-fadeIn"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-600 mb-1">Draw something amazing!</p>
              <p className="text-xs text-zinc-400">Your anime artwork will appear here</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
