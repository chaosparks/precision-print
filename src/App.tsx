import React, { useState, useEffect } from 'react';
import { PaperCanvas } from './components/PaperCanvas';
import { Controls } from './components/Controls';
import { type ImageConfig, Orientation, type PaperConfig } from './types';
import { A4_HEIGHT_MM, A4_WIDTH_MM } from './constants';

const App: React.FC = () => {
  const [imageConfig, setImageConfig] = useState<ImageConfig>({
    url: null,
    x: 0,
    y: 0,
    scale: 0.5,
    rotation: 0,
  });

  const [paperConfig, setPaperConfig] = useState<PaperConfig>({
    orientation: Orientation.PORTRAIT,
    showGrid: true,
  });

  // Calculate scaling factor to fit the paper on screen
  const [screenScale, setScreenScale] = useState(0.5);

  useEffect(() => {
    // Basic responsiveness for the paper preview
    const handleResize = () => {
      const availableHeight = window.innerHeight - 80; // Margin
      const availableWidth = window.innerWidth - 350; // Sidebar width approx
      
      // Target dimensions
      const targetHeightMM = paperConfig.orientation === Orientation.PORTRAIT ? A4_HEIGHT_MM : A4_WIDTH_MM;
      const targetWidthMM = paperConfig.orientation === Orientation.PORTRAIT ? A4_WIDTH_MM : A4_HEIGHT_MM;

      // Approximate pixels (96 DPI is approx 3.78 px/mm, but let's just use relative sizing for fit)
      // We want to fit the paper into the viewport with padding
      // Let's assume standard pixel density for preview calculation
      const PURE_SCALE = 3.78; 
      
      const paperHeightPx = targetHeightMM * PURE_SCALE;
      const paperWidthPx = targetWidthMM * PURE_SCALE;

      const scaleH = availableHeight / paperHeightPx;
      const scaleW = availableWidth / paperWidthPx;
      
      // Use the smaller scale, capped at 1.2
      setScreenScale(Math.min(Math.min(scaleH, scaleW), 1.0) * 0.85); 
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, [paperConfig.orientation]);


  const updateImageConfig = (newConfig: Partial<ImageConfig>) => {
    setImageConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updatePaperConfig = (newConfig: Partial<PaperConfig>) => {
    setPaperConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-container');
    if (!printContent) {
      alert("Content not found");
      return;
    }

    // Open a new window to bypass iframe sandbox 'allow-modals' restriction
    const printWindow = window.open('', '_blank', 'width=1000,height=1000');
    if (!printWindow) {
      alert("Please allow popups for this site to print.");
      return;
    }

    // Construct the full HTML for the print window
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Print - PrecisionPrint A4</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          /* Base Styles */
          body {
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          
          /* Container Reset */
          #print-container {
             margin: 0 !important;
             box-shadow: none !important;
             overflow: hidden !important;
          }

          /* Print Specific Styles */
          @media print {
            @page {
              size: A4 ${paperConfig.orientation};
              margin: 0;
            }
            body {
              background-color: white;
              display: block;
            }
            #print-container {
              position: absolute;
              top: 0;
              left: 0;
            }
            /* Hide non-print elements if any slip through */
            .no-print { display: none !important; }
          }
          
          /* Grid Pattern Styles (Needed since we don't import CSS file) */
          .bg-grid-pattern {
            background-size: 10mm 10mm;
            background-image:
              linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          }
          .bg-grid-pattern-strong {
             background-size: 50mm 50mm;
             background-image:
              linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
        <script>
          // Wait for Tailwind and images to render
          window.onload = function() {
             setTimeout(function() {
               window.print();
             }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      
      {/* Sidebar Controls */}
      <aside className="w-96 flex-shrink-0 z-20 shadow-xl print:hidden">
        <Controls
          imageConfig={imageConfig}
          paperConfig={paperConfig}
          onUpdateImageConfig={updateImageConfig}
          onUpdatePaperConfig={updatePaperConfig}
          onPrint={handlePrint}
        />
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 relative flex items-center justify-center bg-slate-100 overflow-hidden print:bg-white print:block print:h-auto print:w-auto">
        
        {/* Background info (Screen only) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-5 print:hidden">
          <div className="text-9xl font-black tracking-tighter text-slate-900">A4</div>
        </div>

        {/* The Paper Component */}
        {/* We wrap it in a div that handles the screen scaling */}
        <div 
            id="preview-wrapper"
            className="transition-transform duration-300 ease-out origin-center"
            style={{ 
                transform: `scale(${screenScale})`
            }}
        >
             <PaperCanvas
                imageConfig={imageConfig}
                orientation={paperConfig.orientation}
                showGrid={paperConfig.showGrid}
                onUpdateImageConfig={updateImageConfig}
                scaleFactor={screenScale}
             />
        </div>

        {/* Floating Help / Instructions */}
        <div className="absolute bottom-6 right-6 max-w-sm bg-white/90 backdrop-blur border border-gray-200 p-4 rounded-lg shadow-lg text-sm text-gray-600 print:hidden pointer-events-none">
            <h3 className="font-semibold text-gray-800 mb-1">How to use</h3>
            <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Drag the image to position it.</li>
                <li>Use sliders or scroll to zoom.</li>
                <li>Grid helps you align (1cm squares).</li>
                <li>Click <strong>Print</strong> when ready.</li>
            </ul>
        </div>

      </main>
    </div>
  );
};

export default App;