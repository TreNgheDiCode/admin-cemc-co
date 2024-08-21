import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import { Navbar } from "@/components/navbar";
import { analytics } from "@/lib/redis";
import { getDate } from "@/lib/utils";

export default async function Home() {
  const TRACKING_DAY = 7; // Number of days to track
  const pageview = await analytics.retrieveDays("pageview", TRACKING_DAY);
  const register = await analytics.retrieveDays("register", TRACKING_DAY);

  const totalPageViews = pageview.reduce((acc, curr) => {
    return (
      acc +
      curr.events.reduce((acc, curr) => {
        return acc + Object.values(curr)[0]!;
      }, 0)
    );
  }, 0);

  const avgVisitsPerDay = (totalPageViews / TRACKING_DAY).toFixed(1);

  const amtVisitsToday = pageview
    .filter((ev) => ev.date === getDate())
    .reduce((acc, curr) => {
      return (
        acc +
        curr.events.reduce((acc, curr) => {
          return acc + Object.values(curr)[0]!;
        }, 0)
      );
    }, 0);

  const topCountriesMap = new Map<string, number>();

  for (let i = 0; i < pageview.length; i++) {
    const day = pageview[i];

    if (!day) continue;

    for (let j = 0; j < day.events.length; j++) {
      const event = day.events[j];

      if (!event) continue;

      const key = Object.keys(event)[0]!;
      const value = Object.values(event)[0]!;

      const parseKey = JSON.parse(key);
      const country = parseKey.country;

      if (country) {
        if (topCountriesMap.has(country)) {
          const current = topCountriesMap.get(country)!;
          topCountriesMap.set(country, current + value);
        } else {
          topCountriesMap.set(country, value);
        }
      }
    }
  }

  const topContries = [...topCountriesMap.entries()]
    .sort((a, b) => {
      if (a[1] > b[1]) {
        return -1;
      } else {
        return 1;
      }
    })
    .slice(0, 5);

  return (
    <>
      <Navbar title={`Bảng điều khiển`} />
      <main className="py-20 px-10 text-main dark:text-main-foreground">
        <AnalyticsDashboard
          avgVisitsPerDay={avgVisitsPerDay}
          amtVisitsToday={amtVisitsToday}
          timeseriesPageViews={pageview}
          topCountries={topContries}
        />
      </main>
    </>
  );
}
