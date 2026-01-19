"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Pencil, Send, Trash2 } from "lucide-react";

interface DrawingCanvasProps {
  onSend: (imageData: string) => void;
  isGenerating: boolean;
}

export function DrawingCanvas({ onSend, isGenerating }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);

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
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
  };

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
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSend(canvas.toDataURL("image/png"));
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-50 p-4 border-r border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant={color === "#000000" ? "default" : "outline"}
            size="icon"
            onClick={() => setColor("#000000")}
            className="w-8 h-8"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant={color === "#FFFFFF" ? "default" : "outline"}
            size="icon"
            onClick={() => setColor("#FFFFFF")}
            className="w-8 h-8"
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24 accent-neutral-900"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={clearCanvas}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-white rounded-lg shadow-inner overflow-hidden cursor-crosshair">
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
      </div>

      <div className="mt-4">
        <Button
          onClick={handleSend}
          disabled={isGenerating}
          className="w-full h-12 text-lg font-medium tracking-tight"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="animate-pulse">Generating...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Send Doodle <Send className="w-4 h-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
