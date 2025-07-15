"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive line chart"

const chartData = [
  { date: "2025-04-01", desktop: 40, mobile: 150 },
  { date: "2025-04-02", desktop: 20, mobile: 180 },
  { date: "2025-04-03", desktop: 17, mobile: 120 },
  { date: "2025-04-04", desktop: 42, mobile: 260 },
  { date: "2025-04-05", desktop: 73, mobile: 290 },
  { date: "2025-04-06", desktop: 30, mobile: 340 },
  { date: "2025-04-07", desktop: 45, mobile: 180 },
  { date: "2024-04-08", desktop: 19, mobile: 320 },
  { date: "2025-04-09", desktop: 59, mobile: 110 },
  { date: "2025-04-10", desktop: 61, mobile: 190 },
  { date: "2025-04-11", desktop: 37, mobile: 350 },
  { date: "2025-04-12", desktop: 92, mobile: 210 },
  { date: "2025-04-13", desktop: 42, mobile: 380 },
  { date: "2025-04-14", desktop: 37, mobile: 220 },
  { date: "2025-04-15", desktop: 20, mobile: 170 },
  { date: "2025-04-16", desktop: 138, mobile: 190 },
  { date: "2025-04-17", desktop: 46, mobile: 360 },
  { date: "2025-04-18", desktop: 164, mobile: 410 },
  { date: "2025-04-19", desktop: 143, mobile: 180 },
  { date: "2025-04-20", desktop: 89, mobile: 150 },
  { date: "2025-04-21", desktop: 137, mobile: 200 },
  { date: "2025-04-22", desktop: 224, mobile: 170 },
  { date: "2025-04-23", desktop: 138, mobile: 230 },
  { date: "2025-04-24", desktop: 387, mobile: 290 },
  { date: "2025-04-25", desktop: 215, mobile: 250 },
  { date: "2025-04-26", desktop: 75, mobile: 130 },
  { date: "2025-04-27", desktop: 383, mobile: 420 },
  { date: "2025-04-28", desktop: 122, mobile: 180 },
]

const chartConfig = {
  views: {
    label: "Coversation time (minutes)",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartLineInteractive() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("desktop")

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  )

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Convo Stats</CardTitle>
          <CardDescription>
            Showing total conversation time for each platform over the last 30 days.
          </CardDescription>
        </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
