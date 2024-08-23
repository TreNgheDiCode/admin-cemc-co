"use client";

import { CreateSchoolFormValues } from "@/data/schemas/form-schema";
import { PreviewSchoolInformation } from "./preview-school-information";
import { SchoolTabs } from "@/components/schools/school-tabs";
import { PreviewSchoolTabs } from "./preview-school-tabs";
import { PreviewSchoolLocations } from "./preview-school-locations";
import { PreviewSchoolPrograms } from "./preview-school-programs";
import { PreviewSchoolGalleries } from "./preview-school-galleries";

type Props = {
  data?: CreateSchoolFormValues;
};

type TabItem = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

export const CreateSchoolPreview = ({ data }: Props) => {
  if (!data) return null;
  const tabs: TabItem[] = [
    {
      title: "Thông tin",
      value: "info",
      content: (
        <div className="w-full overflow-hidden relative h-full gap-4 rounded-2xl p-10 text-xl md:text-4xl font-bold text-main dark:text-main-foreground dark:bg-main-component shadow-md border bg-main-foreground">
          <PreviewSchoolInformation school={data} />
        </div>
      ),
    },
    {
      title: "Cơ sở",
      value: "locations",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <PreviewSchoolLocations locations={data.locations} />
        </div>
      ),
    },
    {
      title: "Chương trình đào tạo",
      value: "programs",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <PreviewSchoolPrograms programs={data.programs} />
        </div>
      ),
    },
    {
      title: "Bộ sưu tập",
      value: "galleries",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <PreviewSchoolGalleries galleries={data.galleries} />
        </div>
      ),
    },
    {
      title: "Học bổng",
      value: "scholarships",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <p>Học bổng</p>
        </div>
      ),
    },
  ];

  return (
    <div className="size-full [perspective:1000px] relative flex flex-col mx-auto items-start justify-star mb-16">
      <PreviewSchoolTabs tabs={tabs} />
    </div>
  );
};
