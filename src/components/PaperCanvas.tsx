import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Orientation, type ImageConfig } from '../types';
import { A4_WIDTH_MM, A4_HEIGHT_MM, MM_TO_PX } from '../constants';
import { Move } from 'lucide-react';

interface PaperCanvasProps {
  imageConfig: ImageConfig;
  orientation: Orientation;
  showGrid: boolean;
  onUpdateImageConfig: (config: Partial<ImageConfig>) => void;
  scaleFactor?: number; // Zoom level for the editor view
}

export const PaperCanvas: React.FC<PaperCanvasProps> = ({
  imageConfig,
  orientation,
  showGrid,
  onUpdateImageConfig,
  scaleFactor = 1,
}) => {
  const isPortrait = orientation === Orientation.PORTRAIT;
  const widthMM = isPortrait ? A4_WIDTH_MM : A4_HEIGHT_MM;
  const heightMM = isPortrait ? A4_HEIGHT_MM : A4_WIDTH_MM;

  const widthPx = widthMM * MM_TO_PX;
  const heightPx = heightMM * MM_TO_PX;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const dxPx = e.clientX - dragStart.x;
    const dyPx = e.clientY - dragStart.y;

    // Convert screen pixel delta to mm delta
    // Note: The canvas itself might be scaled by CSS transform (scaleFactor), so we divide by it
    const dxMM = dxPx / MM_TO_PX / scaleFactor;
    const dyMM = dyPx / MM_TO_PX / scaleFactor;

    onUpdateImageConfig({
      x: imageConfig.x + dxMM,
      y: imageConfig.y + dyMM,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, imageConfig, onUpdateImageConfig, scaleFactor]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate image style
  // x and y are in mm, from the center of the paper.
  // We need to translate them to CSS position.
  // We use Translate(-50%, -50%) to center the image on its coordinate,
  // then add the offset.
  
  return (
    <div
      id="print-container"
      ref={containerRef}
      className={`relative bg-white shadow-2xl overflow-hidden ${
        !isPortrait ? 'landscape-print' : ''
      }`}
      style={{
        width: `${widthMM}mm`,
        height: `${heightMM}mm`,
        transition: 'width 0.3s ease, height 0.3s ease', // Smooth orientation switch
      }}
    >
      {/* Grid Overlay */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none z-10 print:hidden">
          <div className="w-full h-full bg-grid-pattern opacity-60"></div>
          <div className="absolute inset-0 bg-grid-pattern-strong opacity-40"></div>
          {/* Center Lines */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-blue-400 opacity-50"></div>
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-blue-400 opacity-50"></div>
        </div>
      )}

      {/* Image Container */}
      {imageConfig.url ? (
        <div
          className={`absolute top-1/2 left-1/2 cursor-move ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} origin-center`}
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(calc(-50% + ${imageConfig.x}mm), calc(-50% + ${imageConfig.y}mm)) rotate(${imageConfig.rotation}deg) scale(${imageConfig.scale})`,
            // We use standard img tag behavior for intrinsic sizing, handled by the scale
          }}
        >
          {/* Visual Indicator for Dragging (Screen only) */}
          <div className="absolute inset-0 border-2 border-blue-500 opacity-0 hover:opacity-100 transition-opacity z-20 pointer-events-none print:hidden flex items-center justify-center">
             <Move className="w-8 h-8 text-blue-500 drop-shadow-md bg-white/50 rounded-full p-1" />
          </div>
          
          <img
            src={imageConfig.url}
            alt="Printable"
            className="max-w-none block select-none"
            draggable={false}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 select-none">
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-lg font-medium">No Image Selected</p>
            <p className="text-sm">Upload an image or use AI to generate one.</p>
          </div>
        </div>
      )}
    </div>
  );
};