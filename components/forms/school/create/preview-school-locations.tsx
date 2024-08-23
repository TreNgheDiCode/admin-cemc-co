"use client";

import { CreateSchoolFormValues } from "@/data/schemas/form-schema";
import { PreviewSchoolLocationsList } from "./preview-school-locations-list";

type Props = {
  locations: CreateSchoolFormValues["locations"];
};

export const PreviewSchoolLocations = ({ locations }: Props) => {
  return locations.length > 0 ? (
    <PreviewSchoolLocationsList locations={locations} />
  ) : (
    <div className="text-main dark:text-main-foreground text-2xl">
      Danh sách cơ sở trống
    </div>
  );
};
