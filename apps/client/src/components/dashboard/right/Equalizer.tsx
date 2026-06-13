"use client";

import { audioContextManager } from "@/lib/audioContextManager";
import { RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Band {
  label: string;
  freq: number;
  type: BiquadFilterType;
  defaultGain: number;
}

const EQ_BANDS: Band[] = [
  { label: "32", freq: 32, type: "lowshelf", defaultGain: 0 },
  { label: "64", freq: 64, type: "peaking", defaultGain: 0 },
  { label: "125", freq: 125, type: "peaking", defaultGain: 0 },
  { label: "250", freq: 250, type: "peaking", defaultGain: 0 },
  { label: "500", freq: 500, type: "peaking", defaultGain: 0 },
  { label: "1k", freq: 1000, type: "peaking", defaultGain: 0 },
  { label: "2k", freq: 2000, type: "peaking", defaultGain: 0 },
  { label: "4k", freq: 4000, type: "peaking", defaultGain: 0 },
  { label: "8k", freq: 8000, type: "peaking", defaultGain: 0 },
  { label: "16k", freq: 16000, type: "highshelf", defaultGain: 0 },
];

const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Bass: [6, 5, 3, 1, 0, 0, 0, 0, 0, 0],
  Treble: [0, 0, 0, 0, 0, 1, 2, 3, 5, 6],
  Rock: [4, 3, 1, 0, -1, 1, 2, 3, 3, 2],
  Pop: [-1, 1, 3, 3, 1, 0, -1, -1, 0, 0],
  Jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  Vocal: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
};

const MAX_GAIN = 12;

export const Equalizer = () => {
  const [gains, setGains] = useState<number[]>(EQ_BANDS.map((b) => b.defaultGain));
  const [activePreset, setActivePreset] = useState("Flat");
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const draggingRef = useRef<number | null>(null);
  const sliderRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load saved state on mount
  useEffect(() => {
    try {
      const savedGains = localStorage.getItem("syncora_eq_gains");
      const savedPreset = localStorage.getItem("syncora_eq_preset");
      if (savedGains) {
        const parsed = JSON.parse(savedGains);
        setGains(parsed);
        // We apply gains slightly after mount to ensure audio context is ready
        setTimeout(() => applyGains(parsed), 50);
      }
      if (savedPreset) {
        setActivePreset(savedPreset);
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build EQ filter chain once
  useEffect(() => {
    const ctx = audioContextManager.getContext();
    const inputNode = audioContextManager.getInputNode();

    // Disconnect existing lowpass → masterGain chain and insert EQ filters
    const filters = EQ_BANDS.map((band, i) => {
      const f = ctx.createBiquadFilter();
      f.type = band.type;
      f.frequency.value = band.freq;
      f.gain.value = 0;
      f.Q.value = 1.2;
      return f;
    });

    // Chain: inputNode → f[0] → f[1] → ... → f[n] → destination
    // We insert between the lowpass node (inputNode) and its destination
    // by reconnecting through our filters
    try {
      // Connect filters in series
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      // The last filter connects to the master gain
      const masterGain = audioContextManager.getMasterGain();
      filters[filters.length - 1].connect(masterGain);
      // inputNode should feed into first filter
      inputNode.connect(filters[0]);
    } catch (e) {
      // Might already be connected, ignore
    }

    filtersRef.current = filters;

    return () => {
      filters.forEach((f) => {
        try {
          f.disconnect();
        } catch (_) {}
      });
    };
  }, []);

  const applyGains = useCallback((newGains: number[]) => {
    filtersRef.current.forEach((f, i) => {
      if (f) f.gain.setTargetAtTime(newGains[i], audioContextManager.getContext().currentTime, 0.01);
    });
  }, []);

  const handlePreset = (name: string) => {
    const newGains = PRESETS[name];
    setGains([...newGains]);
    setActivePreset(name);
    try {
      localStorage.setItem("syncora_eq_gains", JSON.stringify(newGains));
      localStorage.setItem("syncora_eq_preset", name);
    } catch (e) {}
    applyGains(newGains);
  };

  const handleReset = () => handlePreset("Flat");

  // Drag-to-set on vertical sliders
  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    draggingRef.current = index;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateGainFromPointer(e.clientY, index);
  };

  const handlePointerMove = (e: React.PointerEvent, index: number) => {
    if (draggingRef.current !== index) return;
    updateGainFromPointer(e.clientY, index);
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  const updateGainFromPointer = (clientY: number, index: number) => {
    const el = sliderRefs.current[index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = 1 - (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, ratio));
    const gain = Math.round((clamped * 2 - 1) * MAX_GAIN);
    setGains((prev) => {
      const next = [...prev];
      next[index] = gain;
      applyGains(next);
      setActivePreset("Custom");
      try {
        localStorage.setItem("syncora_eq_gains", JSON.stringify(next));
        localStorage.setItem("syncora_eq_preset", "Custom");
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 select-none">
      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => handlePreset(name)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150 ${
              activePreset === name
                ? "bg-[#b026ff] text-black"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="flex-1 flex items-stretch gap-1 min-h-0 mt-2">
        {EQ_BANDS.map((band, i) => {
          const gain = gains[i];
          const pct = ((gain + MAX_GAIN) / (MAX_GAIN * 2)) * 100;
          const isPositive = gain > 0;
          const isNeutral = gain === 0;

          return (
            <div key={band.label} className="flex flex-col items-center gap-1.5 flex-1 h-full">
              {/* Gain value */}
              <span
                className={`text-[9px] font-mono tabular-nums ${
                  isNeutral ? "text-neutral-500" : isPositive ? "text-[#b026ff]" : "text-red-400"
                }`}
              >
                {gain > 0 ? "+" : ""}
                {gain}
              </span>

              {/* Vertical slider track */}
              <div
                ref={(el) => {
                  sliderRefs.current[i] = el;
                }}
                className="relative w-full rounded-full cursor-ns-resize flex-1"
                style={{ background: "rgba(255,255,255,0.06)" }}
                onPointerDown={(e) => handlePointerDown(e, i)}
                onPointerMove={(e) => handlePointerMove(e, i)}
                onPointerUp={handlePointerUp}
              >
                {/* Center zero line */}
                <div className="absolute w-full h-px bg-neutral-700" style={{ top: "50%" }} />
                {/* Fill */}
                <motion.div
                  className="absolute w-full rounded-full"
                  style={{
                    background: isNeutral ? "rgba(255,255,255,0.15)" : isPositive ? "#b026ff" : "#f87171",
                    bottom: isPositive ? "50%" : `${100 - pct}%`,
                    top: isPositive ? `${100 - pct}%` : "50%",
                  }}
                  animate={{ opacity: 1 }}
                />
                {/* Thumb */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 shadow-md"
                  style={{
                    bottom: `calc(${pct}% - 6px)`,
                    borderColor: isNeutral ? "#666" : isPositive ? "#b026ff" : "#f87171",
                    background: "#1a1a1a",
                  }}
                  whileHover={{ scale: 1.3 }}
                />
              </div>

              {/* Frequency label */}
              <span className="text-[9px] text-neutral-500 font-mono">{band.label}</span>
            </div>
          );
        })}
      </div>

      {/* dB scale hint */}
      <div className="flex justify-between text-[9px] text-neutral-600 font-mono px-0.5">
        <span>+{MAX_GAIN}dB</span>
        <span>0dB</span>
        <span>-{MAX_GAIN}dB</span>
      </div>
    </div>
  );
};
