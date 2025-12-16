import React, { useState } from 'react';
import { type ImageConfig, Orientation, type PaperConfig } from '../types';
import { Upload, Printer, RotateCw, ZoomIn, ZoomOut, Grid3X3 } from 'lucide-react';

interface ControlsProps {
  imageConfig: ImageConfig;
  paperConfig: PaperConfig;
  onUpdateImageConfig: (config: Partial<ImageConfig>) => void;
  onUpdatePaperConfig: (config: Partial<PaperConfig>) => void;
  onPrint: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  imageConfig,
  paperConfig,
  onUpdateImageConfig,
  onUpdatePaperConfig,
  onPrint,
}) => {
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateImageConfig({ url: event.target.result as string, x: 0, y: 0, scale: 1 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrlInput.trim()) {
      onUpdateImageConfig({ url: imageUrlInput, x: 0, y: 0, scale: 1 });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Printer className="w-6 h-6 text-blue-600" />
          PrecisionPrint
        </h1>
        <p className="text-xs text-gray-500 mt-1">A4 Online Printing Tool</p>
      </div>

      <div className="flex-1 p-6 space-y-8">
        
        {/* Upload Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Image Source</h2>
          
          <div className="space-y-3">
             {/* File Upload */}
            <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-500 hover:bg-blue-50 focus:outline-none">
              <span className="flex flex-col items-center space-y-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="font-medium text-gray-600 text-sm">Drop image or Click to Upload</span>
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            {/* URL Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or paste Image URL..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
              >
                Go
              </button>
            </div>
          </div>
        </section>

        {/* Paper Settings */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Paper Settings</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdatePaperConfig({ orientation: Orientation.PORTRAIT })}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border rounded-md transition-all ${
                paperConfig.orientation === Orientation.PORTRAIT
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-3 h-4 border border-current rounded-sm"></div>
              Portrait
            </button>
            <button
              onClick={() => onUpdatePaperConfig({ orientation: Orientation.LANDSCAPE })}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border rounded-md transition-all ${
                paperConfig.orientation === Orientation.LANDSCAPE
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-3 border border-current rounded-sm"></div>
              Landscape
            </button>
          </div>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={paperConfig.showGrid}
              onChange={(e) => onUpdatePaperConfig({ showGrid: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Grid3X3 className="w-4 h-4 text-gray-400" /> Show Alignment Grid
            </span>
          </label>
        </section>

        {/* Image Adjustment */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex justify-between">
            <span>Adjust Image</span>
            <button 
              onClick={() => onUpdateImageConfig({ x: 0, y: 0, scale: 1, rotation: 0 })}
              className="text-xs text-blue-600 hover:underline normal-case font-normal"
            >
              Reset
            </button>
          </h2>

          <div className="space-y-4">
            {/* Scale */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-500">Scale</label>
                <span className="text-xs font-mono text-gray-700">{(imageConfig.scale * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.01"
                  value={imageConfig.scale}
                  onChange={(e) => onUpdateImageConfig({ scale: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <ZoomIn className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Rotation</label>
              <button
                onClick={() => onUpdateImageConfig({ rotation: (imageConfig.rotation + 90) % 360 })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <RotateCw className="w-4 h-4" />
                Rotate 90° ({imageConfig.rotation}°)
              </button>
            </div>
             
             {/* Position Info */}
             <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div>X: <span className="font-mono text-gray-800">{imageConfig.x.toFixed(1)}mm</span></div>
                <div>Y: <span className="font-mono text-gray-800">{imageConfig.y.toFixed(1)}mm</span></div>
             </div>
          </div>
        </section>
      </div>

      {/* Print Button */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onPrint}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-bold text-lg"
        >
          <Printer className="w-6 h-6" />
          Print Result
        </button>
      </div>
    </div>
  );
};