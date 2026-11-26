'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  currentMin?: number;
  currentMax?: number;
  onApply: (range: { min: number; max: number }) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 0,
  max = 50000,
  step = 500,
  currentMin,
  currentMax,
  onApply,
}) => {
  const baseMin = Math.max(0, Math.floor(Number.isFinite(min) ? min : 0));
  const safeStep = Math.max(1, Number.isFinite(step) ? step : 500);
  const baseMax = Math.max(baseMin + safeStep, Math.ceil(Number.isFinite(max) ? max : 50000));

  const [minVal, setMinVal] = useState<number>(
    currentMin !== undefined && !Number.isNaN(currentMin) ? Math.max(baseMin, currentMin) : baseMin
  );
  const [maxVal, setMaxVal] = useState<number>(
    currentMax !== undefined && !Number.isNaN(currentMax) ? Math.max(baseMin + safeStep, currentMax) : baseMax
  );

  // Manual text inputs (never blocked or overwritten while typing)
  const [minText, setMinText] = useState<string>(
    currentMin !== undefined && !Number.isNaN(currentMin) ? String(currentMin) : String(baseMin)
  );
  const [maxText, setMaxText] = useState<string>(
    currentMax !== undefined && !Number.isNaN(currentMax) ? String(currentMax) : String(baseMax)
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<'min' | 'max' | null>(null);

  // Upper bound for slider visual scale so user-typed max values (like 80000) never break the bar
  const scaleMin = baseMin;
  const scaleMax = Math.max(baseMax, maxVal, minVal + safeStep);

  // Sync only when URL query params (currentMin / currentMax) change
  useEffect(() => {
    const nextMin =
      currentMin !== undefined && !Number.isNaN(currentMin)
        ? Math.max(0, currentMin)
        : baseMin;
    const nextMax =
      currentMax !== undefined && !Number.isNaN(currentMax)
        ? Math.max(nextMin + safeStep, currentMax)
        : baseMax;

    setMinVal(nextMin);
    setMaxVal(nextMax);
    setMinText(String(nextMin));
    setMaxText(String(nextMax));
  }, [currentMin, currentMax, baseMin, baseMax, safeStep]);

  const valueToPercent = useCallback(
    (val: number) => {
      const span = scaleMax - scaleMin;
      if (span <= 0) return 0;
      const pct = ((val - scaleMin) / span) * 100;
      return Math.max(0, Math.min(100, pct));
    },
    [scaleMin, scaleMax]
  );

  const clientXToValue = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return scaleMin;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return scaleMin;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = scaleMin + ratio * (scaleMax - scaleMin);
      const stepped = Math.round(raw / safeStep) * safeStep;
      return Math.max(scaleMin, Math.min(scaleMax, stepped));
    },
    [scaleMin, scaleMax, safeStep]
  );

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clickedVal = clientXToValue(e.clientX);
    const distToMin = Math.abs(clickedVal - minVal);
    const distToMax = Math.abs(clickedVal - maxVal);

    // Choose nearest thumb (if equal and at max, pick min; if equal and at min, pick max)
    let thumb: 'min' | 'max';
    if (distToMin < distToMax) {
      thumb = 'min';
    } else if (distToMax < distToMin) {
      thumb = 'max';
    } else {
      thumb = clickedVal >= maxVal - safeStep ? 'min' : 'max';
    }

    activeThumbRef.current = thumb;
    e.currentTarget.setPointerCapture(e.pointerId);

    if (thumb === 'min') {
      const clampedMin = Math.min(clickedVal, maxVal - safeStep);
      const finalMin = Math.max(scaleMin, clampedMin);
      setMinVal(finalMin);
      setMinText(String(finalMin));
    } else {
      const clampedMax = Math.max(clickedVal, minVal + safeStep);
      const finalMax = Math.min(scaleMax, clampedMax);
      setMaxVal(finalMax);
      setMaxText(String(finalMax));
    }
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeThumbRef.current) return;
    const nextVal = clientXToValue(e.clientX);

    if (activeThumbRef.current === 'min') {
      const clampedMin = Math.max(scaleMin, Math.min(nextVal, maxVal - safeStep));
      setMinVal(clampedMin);
      setMinText(String(clampedMin));
    } else {
      const clampedMax = Math.min(scaleMax, Math.max(nextVal, minVal + safeStep));
      setMaxVal(clampedMax);
      setMaxText(String(clampedMax));
    }
  };

  const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeThumbRef.current) {
      activeThumbRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  const commitAndApply = () => {
    const rawMin = minText.trim() === '' ? 0 : Number(minText);
    const rawMax = maxText.trim() === '' ? baseMax : Number(maxText);

    let finalMin = Number.isNaN(rawMin) ? 0 : Math.max(0, Math.round(rawMin));
    let finalMax = Number.isNaN(rawMax) ? baseMax : Math.max(0, Math.round(rawMax));

    // If user entered min greater than max, swap them cleanly instead of blocking
    if (finalMin > finalMax) {
      const temp = finalMin;
      finalMin = finalMax;
      finalMax = temp;
    }

    if (finalMax <= finalMin) {
      finalMax = finalMin + safeStep;
    }

    setMinVal(finalMin);
    setMaxVal(finalMax);
    setMinText(String(finalMin));
    setMaxText(String(finalMax));

    onApply({ min: finalMin, max: finalMax });
  };

  const leftPct = valueToPercent(minVal);
  const rightPct = valueToPercent(maxVal);

  return (
    <div className="space-y-4 text-left w-full min-w-0">
      {/* Interactive Pointer-Driven Dual Slider */}
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={handleTrackPointerUp}
        onPointerCancel={handleTrackPointerUp}
        role="group"
        aria-label="Price range slider"
        className="relative h-6 flex items-center w-full cursor-pointer touch-none select-none px-2"
      >
        <div className="relative w-full h-1.5 bg-stone-200 rounded-full">
          {/* Active Range Bar */}
          <div
            style={{
              left: `${leftPct}%`,
              width: `${Math.max(0, rightPct - leftPct)}%`,
            }}
            className="absolute top-0 h-full bg-ink-900 rounded-full"
          />

          {/* Min Thumb */}
          <div
            style={{ left: `${leftPct}%` }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-ink-900 border-2 border-white shadow-sm ring-1 ring-ink-900/20"
          />

          {/* Max Thumb */}
          <div
            style={{ left: `${rightPct}%` }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-ink-900 border-2 border-white shadow-sm ring-1 ring-ink-900/20"
          />
        </div>
      </div>

      {/* Manual Min / Max Inputs (No Up/Down Spinners) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1 min-w-0">
          <label
            htmlFor="min-price-input"
            className="block text-[10px] uppercase font-mono tracking-wider text-ink-500"
          >
            Min (৳)
          </label>
          <input
            id="min-price-input"
            type="number"
            inputMode="numeric"
            value={minText}
            onChange={(e) => {
              const val = e.target.value;
              setMinText(val);
              const num = Number(val);
              if (val.trim() !== '' && !Number.isNaN(num) && num >= 0) {
                setMinVal(num);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitAndApply();
              }
            }}
            className="no-spinner w-full min-w-0 px-2.5 py-1.5 bg-white border border-line rounded-sm text-xs font-mono text-ink-900 focus:outline-none focus:border-ink-900"
          />
        </div>

        <div className="space-y-1 min-w-0">
          <label
            htmlFor="max-price-input"
            className="block text-[10px] uppercase font-mono tracking-wider text-ink-500"
          >
            Max (৳)
          </label>
          <input
            id="max-price-input"
            type="number"
            inputMode="numeric"
            value={maxText}
            onChange={(e) => {
              const val = e.target.value;
              setMaxText(val);
              const num = Number(val);
              if (val.trim() !== '' && !Number.isNaN(num) && num >= 0) {
                setMaxVal(num);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitAndApply();
              }
            }}
            className="no-spinner w-full min-w-0 px-2.5 py-1.5 bg-white border border-line rounded-sm text-xs font-mono text-ink-900 focus:outline-none focus:border-ink-900"
          />
        </div>
      </div>

      {/* Apply Filter Button */}
      <button
        type="button"
        onClick={commitAndApply}
        className="w-full py-2 bg-ink-900 hover:bg-black text-white text-xs font-semibold rounded-sm transition-colors shadow-xs"
      >
        Apply Price Range
      </button>

      <style jsx>{`
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinner[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};