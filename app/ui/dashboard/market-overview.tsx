"use client";

import { MarketData } from "@/app/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/ui/components/card";
import { DollarSign, BarChart3, TrendingUp, Activity } from "lucide-react";

export default function MarketOverview({ data }: { data: MarketData }) {
  return (
    <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Market Cap
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${data.totalMarketCap.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">+2.5% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Volume</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${data.dailyVolume.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">+12% from yesterday</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Gainer</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.topGainer.name}</div>
          <p className="text-xs text-green-500">
            +{data.topGainer.percentage}%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Loser</CardTitle>
          <Activity className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.topLoser.name}</div>
          <p className="text-xs text-red-500">{data.topLoser.percentage}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
