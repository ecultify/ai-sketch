"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eraser, Pencil, Trash2 } from "lucide-react";

interface DrawingCanvasProps {
  onGenerate: (imageData: string, prompt: string, imagination: number) => void;
  onClear?: () => void;
  isGenerating: boolean;
  autoGenerate?: boolean;
}

export function DrawingCanvas({ onGenerate, onClear, isGenerating, autoGenerate = true }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [prompt, setPrompt] = useState("");
  const [imagination, setImagination] = useState(50); // 0-100, controls structure weight
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasGeneratedRef = useRef(false); // Track if we've generated for current drawing

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        const tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(tempImage, 0, 0);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    hasGeneratedRef.current = false; // Reset generation flag when starting new drawing
    draw(e);
  };

  const triggerAutoGeneration = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only generate if we haven't already generated for this drawing session
    if (hasGeneratedRef.current) {
      return;
    }

    // Set new timer for auto-generation (1 second after stopping drawing)
    debounceTimerRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas && prompt.trim() && !isGenerating && !hasGeneratedRef.current) {
        hasGeneratedRef.current = true; // Mark as generated
        const imageData = canvas.toDataURL("image/png");
        onGenerate(imageData, prompt, imagination);
      }
    }, 1000);
  }, [prompt, isGenerating, imagination, onGenerate]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
    
    // Trigger auto-generation after drawing stops (debounced)
    if (autoGenerate && prompt.trim()) {
      triggerAutoGeneration();
    }
  }, [autoGenerate, prompt, triggerAutoGeneration]);

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear any pending generation timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Reset generation flag
    hasGeneratedRef.current = false;
    
    // Clear the prompt
    setPrompt("");
    
    // Notify parent to clear the generated image
    if (onClear) {
      onClear();
    }
  };

  const handleManualGenerate = () => {
    const canvas = canvasRef.current;
    if (canvas && prompt.trim()) {
      hasGeneratedRef.current = true;
      onGenerate(canvas.toDataURL("image/png"), prompt, imagination);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-2 shadow-sm border border-neutral-200">
        <div className="flex gap-2 items-center">
          <Button
            variant={color === "#000000" ? "default" : "outline"}
            size="icon"
            onClick={() => setColor("#000000")}
            className="w-9 h-9 rounded-lg transition-all"
            title="Draw"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant={color === "#FFFFFF" ? "default" : "outline"}
            size="icon"
            onClick={() => setColor("#FFFFFF")}
            className="w-9 h-9 rounded-lg transition-all"
            title="Erase"
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-neutral-500 font-medium">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-24 h-2 accent-neutral-900 cursor-pointer"
            />
            <span className="text-xs text-neutral-600 font-mono w-5">{lineWidth}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearCanvas}
          className="w-9 h-9 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
          title="Clear canvas"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 relative bg-white rounded-xl shadow-lg overflow-hidden border-2 border-neutral-200 cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="absolute inset-0 w-full h-full touch-none"
        />
        {!prompt.trim() && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-neutral-300 text-sm font-medium">Describe what you'll draw below, then start sketching</p>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-neutral-700 mb-2">
            What are you drawing?
          </label>
          <Input
            id="prompt"
            type="text"
            placeholder="e.g., cat, person, tree, house..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            className="w-full text-base"
          />
          {isGenerating && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
              <p className="text-xs text-neutral-600 font-medium">
                Generating your anime artwork...
              </p>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="imagination" className="block text-sm font-medium text-neutral-700 mb-2">
            Imagination Level
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-medium">Precise</span>
            <input
              id="imagination"
              type="range"
              min="0"
              max="100"
              value={imagination}
              onChange={(e) => setImagination(parseInt(e.target.value))}
              disabled={isGenerating}
              className="flex-1 h-2 accent-neutral-900 cursor-pointer"
            />
            <span className="text-xs text-neutral-500 font-medium">Creative</span>
            <span className="text-xs text-neutral-600 font-mono w-8 text-center">{imagination}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {imagination < 30 ? "Follows your sketch closely" : imagination < 70 ? "Balanced interpretation" : "More creative freedom"}
          </p>
        </div>
        {!autoGenerate && (
          <Button
            onClick={handleManualGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-12 text-lg font-medium tracking-tight"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">Generating...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Anime Image
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
