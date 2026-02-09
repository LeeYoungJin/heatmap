"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { MarketData, Stock, Sector } from "@/types/market";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HeatmapProps {
  data: MarketData;
  width: number;
  height: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // 1. Treemap Layout Calculation
  const root = useMemo(() => {
    const hierarchy = d3
      .hierarchy(data)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<any>()
      .size([width, height])
      .paddingOuter(4)
      .paddingTop(24)
      .paddingInner(1)
      .round(false);

    return treemapLayout(hierarchy);
  }, [data, width, height]);

  const getColor = (change: number) => {
    if (change <= -3) return "#8b0000";
    if (change <= -2) return "#bf0000";
    if (change <= -1) return "#f63538";
    if (change < 0) return "#414554";
    if (change === 0) return "#414554";
    if (change < 1) return "#35764e";
    if (change < 2) return "#2f9e4f";
    if (change < 3) return "#30cc5a";
    return "#008000";
  };

  // 2. Main Render Function (Canvas)
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Render Sectors & Stocks
    root.children?.forEach((sectorNode: any) => {
      const isSectorHovered = hoveredSector === sectorNode.data.id;

      // Draw Stocks
      sectorNode.children?.forEach((stockNode: any) => {
        const stock = stockNode.data as Stock;
        const x = stockNode.x0;
        const y = stockNode.y0;
        const w = stockNode.x1 - stockNode.x0;
        const h = stockNode.y1 - stockNode.y0;

        // Stock Rect
        ctx.fillStyle = getColor(stock.change);
        ctx.fillRect(x, y, w, h);
        
        // Stock Border
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 0.5 / transform.k;
        ctx.strokeRect(x, y, w, h);

        // Text Rendering - Improved Algorithm
        const area = w * h;
        const sideLength = Math.sqrt(area);
        // Calculate font size based on area but constrained by dimensions to prevent overflow
        let fontSizeName = Math.max(8, Math.min(sideLength * 0.12, w * 0.7 / stock.name.length * 1.2, h * 0.35));
        
        // Boost size for very large blocks to ensure "Giants" stand out, but more subtly
        if (sideLength > 100) fontSizeName *= 1.1;
        fontSizeName = Math.min(fontSizeName, 64); // Cap at 64px for a cleaner look

        if (w > 15 / transform.k && h > 10 / transform.k) {
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Name rendering with dynamic font size
          ctx.font = `bold ${fontSizeName}px sans-serif`;
          
          // Truncate Name logic using current font
          let displayName = stock.name;
          const metrics = ctx.measureText(displayName);
          if (metrics.width > w - 4) {
             while (ctx.measureText(displayName + "...").width > w - 4 && displayName.length > 0) {
                displayName = displayName.slice(0, -1);
             }
             if (displayName.length < stock.name.length) displayName += "...";
          }

          const hasSpaceForChange = h > fontSizeName * 1.8;
          const nameY = hasSpaceForChange ? y + h/2 - fontSizeName * 0.3 : y + h/2;
          
          ctx.fillText(displayName, x + w/2, nameY);

          // Change % Rendering
          if (hasSpaceForChange) {
            const fontSizeChange = fontSizeName * 0.7;
            ctx.font = `${fontSizeChange}px sans-serif`;
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillText(`${stock.change > 0 ? "+" : ""}${stock.change}%`, x + w/2, nameY + fontSizeName * 1.0);
          }
        }
      });

      // Sector Border (Highlight)
      ctx.strokeStyle = isSectorHovered ? "white" : "#444";
      ctx.lineWidth = (isSectorHovered ? 2 : 1) / transform.k;
      ctx.strokeRect(sectorNode.x0, sectorNode.y0, sectorNode.x1 - sectorNode.x0, sectorNode.y1 - sectorNode.y0);

      // Sector Label
      ctx.fillStyle = isSectorHovered ? "white" : "#999";
      ctx.font = `bold ${12 / transform.k}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(sectorNode.data.name, sectorNode.x0 + 8/transform.k, sectorNode.y0 + 16/transform.k);
    });

    ctx.restore();
  }, [root, width, height, transform, hoveredSector]);

  // 3. Zoom Handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        setTransform(event.transform);
      });

    d3.select(canvas).call(zoom);
    
    // Reset transform when dimensions change to prevent "escaping" the view
    d3.select(canvas).transition().duration(0).call(zoom.transform, d3.zoomIdentity);
  }, [width, height]);

  // 4. Request Animation Frame for Drawing
  useEffect(() => {
    const render = () => {
      draw();
      requestAnimationFrame(render);
    };
    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [draw]);

  // 5. Picking (Hover Detection)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert screen coordinates to data coordinates
    const dataX = (mx - transform.x) / transform.k;
    const dataY = (my - transform.y) / transform.k;

    setMousePos({ x: mx, y: my });

    // Find sector and stock under mouse
    let foundSectorId: string | null = null;
    let foundStock: Stock | null = null;

    root.children?.forEach((sectorNode: any) => {
      if (dataX >= sectorNode.x0 && dataX <= sectorNode.x1 && dataY >= sectorNode.y0 && dataY <= sectorNode.y1) {
        foundSectorId = sectorNode.data.id;
        sectorNode.children?.forEach((stockNode: any) => {
          if (dataX >= stockNode.x0 && dataX <= stockNode.x1 && dataY >= stockNode.y0 && dataY <= stockNode.y1) {
            foundStock = stockNode.data;
          }
        });
      }
    });

    setHoveredSector(foundSectorId);
    setHoveredStock(foundStock);
  };

  const resetZoom = () => {
    if (canvasRef.current) {
      d3.select(canvasRef.current)
        .transition()
        .duration(750)
        .call(d3.zoom<HTMLCanvasElement, unknown>().transform, d3.zoomIdentity);
    }
  };

  return (
    <div className="relative font-sans select-none bg-black rounded-lg overflow-hidden border border-neutral-800">
      <canvas
        ref={canvasRef}
        width={width * (typeof window !== "undefined" ? window.devicePixelRatio : 1)}
        height={height * (typeof window !== "undefined" ? window.devicePixelRatio : 1)}
        style={{ width: `${width}px`, height: `${height}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredSector(null); setHoveredStock(null); }}
        className="cursor-grab active:cursor-grabbing"
      />

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button 
          onClick={resetZoom}
          className="bg-neutral-900/80 hover:bg-neutral-800 text-white text-[10px] px-2 py-1 rounded border border-neutral-700 backdrop-blur-sm transition-colors"
        >
          Reset View
        </button>
        <div className="bg-neutral-900/80 text-neutral-400 text-[10px] px-2 py-1 rounded border border-neutral-700 backdrop-blur-sm">
          Zoom: {Math.round(transform.k * 100)}%
        </div>
      </div>

      {/* Hover Overlay for Sector Stock List */}
      {hoveredSector && (
        <div 
          className="absolute z-20 w-64 bg-neutral-950/95 border border-neutral-700 rounded-lg p-4 shadow-2xl backdrop-blur-md pointer-events-none"
          style={{
            left: Math.min(mousePos.x + 20, width - 280),
            top: Math.min(mousePos.y + 20, height - 200),
          }}
        >
          <h3 className="text-white font-bold mb-2 border-b border-neutral-800 pb-1 flex justify-between items-center">
            <span>{data.children.find(s => s.id === hoveredSector)?.name}</span>
            <span className="text-[10px] text-neutral-500 font-normal">Sector View</span>
          </h3>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {data.children
              .find(s => s.id === hoveredSector)
              ?.children.map(stock => (
                <li key={stock.id} className={cn(
                  "flex justify-between text-sm py-0.5 border-b border-neutral-900 last:border-0",
                  hoveredStock?.id === stock.id ? "bg-white/5" : ""
                )}>
                  <span className={cn(
                    hoveredStock?.id === stock.id ? "text-white font-bold" : "text-neutral-300"
                  )}>{stock.name}</span>
                  <span className={cn(
                    stock.change > 0 ? "text-green-400" : stock.change < 0 ? "text-red-400" : "text-neutral-500",
                    "font-mono font-bold"
                  )}>
                    {stock.change > 0 ? `+${stock.change}` : stock.change}%
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};
