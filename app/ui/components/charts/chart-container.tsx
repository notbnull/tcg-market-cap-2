"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import PriceChart from "./price-chart";

interface PriceData {
  date: string;
  value: number;
}

interface ChartContainerProps {
  data: PriceData[];
}

export default function ChartContainer({ data }: ChartContainerProps) {
  return (
    <div className="w-full rounded-lg p-4" style={{ height: "300px" }}>
      <div style={{ height: "100%", width: "100%" }}>
        <PriceChart data={data} />
      </div>
    </div>
  );
}
