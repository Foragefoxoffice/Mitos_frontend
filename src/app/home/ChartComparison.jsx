// ChartComparison.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

const LegendDot = ({ color }) => (
  <span
    className="inline-block w-3 h-3 rounded-full mr-2"
    style={{ background: color, boxShadow: "0 0 0 4px rgba(0,0,0,0.04)" }}
  />
);

export default function ChartComparison({
  title = "Chart",
  data: initialData,
  live = false,
}) {
  const [data, setData] = useState(initialData);

  // Gentle “live” jiggle
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setData((prev) =>
        prev.map((d, i) => {
          const jitter = Math.sin(Date.now() / 700 + i) * 0.6;
          return {
            ...d,
            withMitos: Math.max(0, d.withMitos + jitter),
            withoutMitos: Math.max(0, d.withoutMitos + jitter * 0.35),
          };
        })
      );
    }, 700);
    return () => clearInterval(id);
  }, [live]);

  const maxY = useMemo(
    () =>
      Math.max(...data.map((d) => Math.max(d.withMitos, d.withoutMitos))) * 1.2,
    [data]
  );

  return (
    <section className="w-full flex justify-center px-2 md:px-2 md:py-8 py-4">
      <div className="w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-10">
          <h2
            style={{ fontWeight: 800 }}
            className="text-3xl md:text-5xl mb-4 bg-gradient-to-r from-[#2f1042] to-[#bf6af4] bg-clip-text text-transparent"
          >
            Chart
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center md:gap-6 gap-1 mb-4">
          <div className="px-4 py-2 border rounded-xl bg-white shadow-sm">
            <LegendDot color="#22c55e" />
            <span className="text-sm font-medium">You with mitos learning</span>
          </div>
          <div className="px-4 py-2 border rounded-xl bg-white shadow-sm">
            <LegendDot color="#6366f1" />
            <span className="text-sm font-medium">Without mitos earning</span>
          </div>
        </div>

        {/* Chart Card */}
        <div className="relative rounded-3xl p-4 md:p-6">
          {/* subtle diagonal band */}
          <div className="pointer-events-none absolute inset-0" />

          {/* NEET TOPPER label */}
          <div className="absolute text-center left-[-0px] top-[20%] font-medium md:-left-24 md:text-sm text-[#000] md:font-medium text-[10px]">
            NEET TOPPER
          </div>

          {/* Y Label with typos */}
          <div className="absolute text-center left-[-0px] md:top-[60%] top-[50%] md:-left-24 text-[10px] md:text-sm text-[#000] font-medium">
            Subjeit understanding
            <br /> & Accurary
          </div>

          {/* X Label */}
          <div className=" left-1/2 -translate-x-1/2 -bottom-6 md:-bottom-8 text-xs md:text-sm text-gray-700 font-medium">
            Time & Effort
          </div>

          <div className="h-[280px] md:h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="withFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="withoutFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.04} />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} strokeOpacity={0.2} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, Math.max(1, maxY)]}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ strokeOpacity: 0.1 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #eee",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                  }}
                  formatter={(value) => Number(value).toFixed(1)}
                  labelClassName="text-sm font-medium"
                />
                <Area
                  type="monotone"
                  dataKey="withoutMitos"
                  stroke="#6366f1"
                  fill="url(#withoutFill)"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive
                />
                <Area
                  type="monotone"
                  dataKey="withMitos"
                  stroke="#22c55e"
                  fill="url(#withFill)"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live toggle */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[#6F3195]"
              checked={live}
              readOnly
            />
            Live animation
          </label>
        </div>
      </div>
    </section>
  );
}
