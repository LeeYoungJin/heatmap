"use client";

import React, { useEffect, useState, useRef } from "react";
import { Heatmap } from "@/components/Heatmap";
import { mockMarketData } from "@/data/marketData";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: Math.max(containerRef.current.offsetWidth * 0.6, 600),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              K-Market <span className="text-green-500">Heatmap</span>
            </h1>
            <p className="text-neutral-400 text-sm max-w-2xl">
              S&P 500 Map 스타일의 국내 증시 업종별 히트맵입니다. 섹터 위에 마우스를 올리면 상세 종목 리스트를 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold bg-neutral-900/80 p-3 rounded-lg border border-neutral-800 shadow-inner">
            <span className="text-neutral-500 uppercase tracking-widest text-[9px] mr-1">Performance</span>
            <div className="flex items-center gap-0.5 ml-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-5 rounded-l-sm" style={{ backgroundColor: "#8b0000" }}></div>
                <span className="mt-1.5 text-neutral-500">-3%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-5" style={{ backgroundColor: "#bf0000" }}></div>
                <span className="mt-1.5 text-neutral-500">-2%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-5" style={{ backgroundColor: "#f63538" }}></div>
                <span className="mt-1.5 text-neutral-500">-1%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-5" style={{ backgroundColor: "#414554" }}></div>
                <span className="mt-1.5 text-neutral-400">0%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-5" style={{ backgroundColor: "#35764e" }}></div>
                <span className="mt-1.5 text-neutral-500">+1%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-5" style={{ backgroundColor: "#2f9e4f" }}></div>
                <span className="mt-1.5 text-neutral-500">+2%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-5 rounded-r-sm" style={{ backgroundColor: "#30cc5a" }}></div>
                <span className="mt-1.5 text-neutral-500">+3%</span>
              </div>
            </div>
          </div>
        </header>

        <div ref={containerRef} className="w-full">
          {dimensions.width > 0 && (
            <Heatmap
              data={mockMarketData}
              width={dimensions.width}
              height={dimensions.height}
            />
          )}
        </div>

        <footer className="mt-8 pt-8 border-t border-neutral-900 text-neutral-600 text-[11px] flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p>© 2026 K-Market Insight. 국내 증시 시각화 분석 도구.</p>
            <p className="mt-1 text-neutral-700">본 서비스에서 제공하는 정보는 투자 참고용이며 오류가 발생할 수 있습니다.</p>
          </div>
          <div className="flex gap-6 items-start">
            <div className="flex flex-col">
              <span className="text-neutral-500 font-bold mb-1 uppercase tracking-tighter">Market</span>
              <span>KOSPI / KOSDAQ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 font-bold mb-1 uppercase tracking-tighter">Classification</span>
              <span>KRX Sector Indices</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 font-bold mb-1 uppercase tracking-tighter">Updated</span>
              <span>2026-02-09 16:26:01</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
