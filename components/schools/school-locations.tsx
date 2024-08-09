import { GetSchoolLocations } from "@/data/schools";
import { SchoolLocationsList } from "./school-locations-list";

type Props = {
  schoolId: string;
};

export const SchoolLocations = async ({ schoolId }: Props) => {
  const locations = await GetSchoolLocations(schoolId);

  return locations.length > 0 ? (
    <SchoolLocationsList locations={locations} schoolId={schoolId} />
  ) : (
    <div className="text-main dark:text-main-foreground text-2xl">
      Danh sách cơ sở trống
    </div>
  );
};
