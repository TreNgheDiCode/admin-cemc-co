import { GetSchoolGalleries } from "@/data/schools";
import { SchoolGalleriesList } from "./school-galleries-list";

type Props = {
  schoolId: string;
};

export const SchoolGalleries = async ({ schoolId }: Props) => {
  const galleries = await GetSchoolGalleries(schoolId);

  return galleries.length > 0 ? (
    <SchoolGalleriesList galleries={galleries} schoolId={schoolId} />
  ) : (
    <div className="text-main dark:text-main-foreground text-2xl">
      Danh sách bộ sưu tập trống
    </div>
  );
};
