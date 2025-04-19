"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

// Define the data shape for our price chart
interface PriceData {
  date: string;
  value: number;
}

interface PriceChartProps {
  data: PriceData[];
  color?: string;
}

// Custom formatter for price values
const PriceFormatter = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

// Custom tooltip component with proper typings
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className=" p-2 rounded border border-gray-700 text-xs">
        <p className="text-gray-300 mb-1">{label}</p>
        <p className="text-green-500 font-bold">
          {PriceFormatter(payload[0].value as number)}
        </p>
      </div>
    );
  }
  return null;
};

// Type for chart mouse events
interface ChartMouseEvent {
  activePayload?: Array<{
    value: number;
    [key: string]: unknown;
  }>;
  activeTooltipIndex?: number;
  activeLabel?: string;
}

export default function PriceChart({
  data,
  color = "#22c55e",
}: PriceChartProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMouseMove = (props: ChartMouseEvent) => {
    if (props && props.activePayload && props.activePayload.length) {
      setHoveredValue(props.activePayload[0].value);
    }
  };

  const handleMouseLeave = () => {
    setHoveredValue(null);
  };

  if (!isClient) {
    return (
      <div className="w-full h-full  opacity-70">
        <div className="flex h-full items-center justify-center">
          <div className="animate-pulse text-gray-400 text-sm">
            Loading chart...
          </div>
        </div>
      </div>
    );
  }

  // Use fallback data if needed
  const chartData =
    data.length > 0
      ? data
      : [
          { date: "2023-01-01", value: 400 },
          { date: "2023-01-02", value: 300 },
          { date: "2023-01-03", value: 500 },
        ];

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ minHeight: "200px" }}
      ref={chartContainerRef}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickFormatter={(value) => {
                // Simplify date format to MM/DD
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis domain={["dataMin - 1000", "dataMax + 1000"]} hide={true} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
