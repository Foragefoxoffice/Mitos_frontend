// ChartComparison.jsx
"use client";
import React, { useEffect, useMemo, useState, useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaCircleDot } from "react-icons/fa6";

// Generate 5 evenly spaced weeks and force green growth from 1% → 100%
function generateData(blueData = []) {
  const base = Array.from({ length: 5 }, (_, i) => {
    const weekLabel = `Week ${i + 1}`;
    const blueMatch = blueData.find(
      (d) => String(d.label).toLowerCase() === weekLabel.toLowerCase()
    );
    return {
      label: weekLabel,
      // Smooth exponential-like growth for green
      withMitos: Math.round(1 + Math.pow(i / 4, 1.5) * 99),
      withoutMitos: blueMatch?.withoutMitos ?? Math.round(20 + i * 10),
    };
  });
  return base;
}

export default function ChartComparison({
  title = "Your NEET Prep Trajectory",
  data: initialData = [],
  live = false,
  className = "",
}) {
  const uid = useId();
  const [data, setData] = useState(generateData(initialData));

  useEffect(() => {
    setData(generateData(initialData));
  }, [initialData]);

  // Optional live jiggle for blue line only
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setData((prev) =>
        prev.map((d, i) => ({
          ...d,
          withoutMitos: Math.max(
            1,
            Math.min(100, d.withoutMitos + Math.sin(Date.now() / 600 + i) * 1.5)
          ),
        }))
      );
    }, 700);
    return () => clearInterval(id);
  }, [live]);

  const yTicks = [0, 20, 40, 60, 80, 100];

  return (
    <section
      className={`w-full flex justify-center px-2 md:px-2 md:py-8 py-4 ${className}`}
    >
      <div className="w-full max-w-6xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h2
            style={{ fontWeight: 800 }}
            className="text-3xl md:text-5xl bg-gradient-to-r from-[#2f1042] to-[#bf6af4] bg-clip-text text-transparent"
          >
            {title}
          </h2>
        </div>

        {/* Legend */}
        <div className="flex justify-center">
          <div className="inline-block py-3 px-4 rounded-xl mb-5 bg-[#FEF8FF] border border-[#B886C1]">
            <div className="flex items-center gap-2">
              <FaCircleDot color="#22c55e" />
              <span className="text-sm md:text-base font-semibold text-[#2D2D2D]">
                You with Mitos (1% → 100%)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FaCircleDot color="#6366f1" />
              <span className="text-sm md:text-base font-semibold text-[#2D2D2D]">
                Without Mitos
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative rounded-3xl p-4 md:p-6 bg-white shadow-sm">
          {/* Axis labels */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-2 md:-left-24 top-1/2 -translate-y-1/2 text-[10px] md:text-sm text-black font-medium">
              Subject Understanding
              <br /> & Accuracy
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 md:-bottom-6 text-xs md:text-sm text-gray-700 font-medium">
              Time & Effort (Weeks 1–5)
            </div>
          </div>

          <div className="h-[350px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient
                    id={`withFill-${uid}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient
                    id={`withoutFill-${uid}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                  domain={[0, 100]}
                  ticks={yTicks}
                  tickFormatter={(v) => `${v}%`}
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
                  formatter={(value) => `${Math.round(value)}%`}
                  labelClassName="text-sm font-medium"
                />

                {/* Blue line */}
                <Area
                  type="monotone"
                  dataKey="withoutMitos"
                  name="Without Mitos"
                  stroke="#6366f1"
                  fill={`url(#withoutFill-${uid})`}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive
                />

                {/* Green line: smooth growth */}
                <Area
                  type="monotone"
                  dataKey="withMitos"
                  name="With Mitos"
                  stroke="#22c55e"
                  fill={`url(#withFill-${uid})`}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
