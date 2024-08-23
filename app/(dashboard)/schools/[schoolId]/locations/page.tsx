import { UpdateSchoolLocation } from "@/components/forms/school/update/update-school-location";
import { Navbar } from "@/components/navbar";
import { UpdateSchoolLocationFormValues } from "@/data/schemas/form-schema";
import { GetSchoolLocations } from "@/data/schools";

export const metadata = {
  title: "Cập nhật cơ sở trường học | CANADA MEDICAL AND EDUCATION",
};

type Props = {
  params: {
    schoolId: string;
  };
};

const UpdateLocationsSchoolPage = async ({ params }: Props) => {
  const locations = await GetSchoolLocations(params.schoolId);
  const initialData: UpdateSchoolLocationFormValues = {
    locations: locations.map((location) => ({
      ...location,
      description: location.description || "",
    })),
  };

  return (
    <>
      <Navbar title="Cập nhật cơ sở trường học" />
      <div className="pt-20">
        <UpdateSchoolLocation
          initialData={initialData}
          schoolId={params.schoolId}
        />
      </div>
    </>
  );
};

export default UpdateLocationsSchoolPage;
