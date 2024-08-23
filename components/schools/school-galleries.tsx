import { GetSchoolGalleries } from "@/data/schools";
import { SchoolGalleriesList } from "./school-galleries-list";

type Props = {
  schoolId: string;
};

export const SchoolGalleries = async ({ schoolId }: Props) => {
  const galleries = await GetSchoolGalleries(schoolId);

  return <SchoolGalleriesList galleries={galleries} schoolId={schoolId} />;
};
