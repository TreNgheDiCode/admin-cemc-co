"use client";

import { analytics } from "@/lib/redis";
import { cn } from "@/lib/utils";
import { BarChart, Card } from "@tremor/react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

type Props = {
  avgVisitsPerDay: string;
  amtVisitsToday: number;
  timeseriesPageViews: Awaited<ReturnType<typeof analytics.retrieveDays>>;
  topCountries: [string, number][];
};

const AnalyticBadge = ({ percentage }: { percentage: number }) => {
  const isPositive = percentage > 0;
  const isNeutral = percentage === 0;
  const isNegative = percentage < 0;

  const positiveClass = "bg-green-100 text-green-800 ring-green-500";
  const neutralClass = "bg-gray-100 text-gray-800 ring-gray-500";
  const negativeClass = "bg-red-100 text-red-800 ring-red-500";

  if (isNaN(percentage)) return null;

  return (
    <span
      className={cn(
        "inline-flex gap-1 items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        {
          [positiveClass]: isPositive,
          [neutralClass]: isNeutral,
          [negativeClass]: isNegative,
        }
      )}
    >
      {isPositive && <ArrowUpRight className="size-3" />}
      {isNeutral && <ArrowRight className="size-3" />}
      {isNegative && <ArrowDownRight className="size-3" />}
      <span>{percentage.toFixed(1)}%</span>
    </span>
  );
};

const AnalyticsDashboard = ({
  avgVisitsPerDay,
  amtVisitsToday,
  timeseriesPageViews,
  topCountries,
}: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid w-full mx-auto grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="w-full mx-auto max-w-xs">
          <p className="text-main dark:text-main-foreground">
            Truy cập trung bình (lượt/ngày)
          </p>
          <p className="text-3xl text-main dark:text-main-foreground font-semibold">
            {avgVisitsPerDay}
          </p>
        </Card>
        <Card className="w-full mx-auto max-w-xs">
          <p className="flex items-center gap-2.5 text-main dark:text-main-foreground">
            Truy cập hôm nay (lượt)
            <AnalyticBadge
              percentage={
                ((amtVisitsToday - Number(avgVisitsPerDay)) /
                  Number(avgVisitsPerDay)) *
                100
              }
            />
          </p>
          <p className="text-3xl text-main dark:text-main-foreground font-semibold">
            {amtVisitsToday}
          </p>
        </Card>
      </div>
      <Card className="flex flex-col sm:grid grid-cols-4 gap-6">
        <h2 className="text-main dark:text-main-foreground w-full text-center sm:text-left font-semibold text-xl">
          Quốc gia truy cập nhiều nhất
        </h2>
        <div className="col-span-3 flex items-center justify-between flex-wrap gap-8">
          {topCountries.map(([code, number]) => {
            return (
              <div key={code} className="flex items-center gap-3">
                <p className="hidden sm:block text-tremor-content dark:text-tremor-content-strong">
                  {code}
                </p>
                <ReactCountryFlag
                  className="text-5xl sm:text-3xl"
                  svg
                  countryCode={code}
                />
                <p className="text-tremor-content dark:text-tremor-content-strong">
                  {number}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        {timeseriesPageViews ? (
          <BarChart
            allowDecimals={false}
            showAnimation
            data={timeseriesPageViews.map((pageview) => ({
              date: pageview.date,
              "Lượt truy cập": pageview.events.reduce((acc, curr) => {
                return acc + Object.values(curr)[0]!;
              }, 0),
            }))}
            categories={["Lượt truy cập"]}
            index="date"
          ></BarChart>
        ) : null}
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
