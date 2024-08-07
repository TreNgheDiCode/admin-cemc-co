import Loading from "@/components/loading";
import { Navbar } from "@/components/navbar";
import { SchoolInformation } from "@/components/schools/school-information";
import { SchoolTabs } from "@/components/schools/school-tabs";
import { StudentSchoolTable } from "@/components/tables/schools/student-school-table";
import { GetSchoolInformation, GetSchools } from "@/data/schools";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Thông tin trường học | CANADA MEDICAL AND EDUCATION",
};

export async function generateStaticParams() {
  const data = await GetSchools();

  if (!data || !data.data) {
    redirect("/schools");
  }

  const schools = data.data;

  return schools.map((school) => ({
    schoolId: school.id,
  }));
}

type Props = {
  params: {
    schoolId: string;
  };
};

type TabItem = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

const SchoolIdPage = async ({ params }: Props) => {
  const school = await GetSchoolInformation(params.schoolId);

  if (!school) {
    redirect("/schools");
  }

  const tabs: TabItem[] = [
    {
      title: "Thông tin",
      value: "info",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl shadow-md border">
          <SchoolInformation school={school} />
        </div>
      ),
    },
    {
      title: "Học sinh",
      value: "students",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <Suspense fallback={<Loading />}>
            <StudentSchoolTable schoolId={params.schoolId} />
          </Suspense>
        </div>
      ),
    },
    {
      title: "Cơ sở",
      value: "teachers",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900">
          <p>Cơ sở</p>
        </div>
      ),
    },
    {
      title: "Chương trình đào tạo",
      value: "courses",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900">
          <p>Chương trình đào tạo</p>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar title={`Thông tin trường học`} description={school.name} />
      {!school.isPublished && (
        <div className="w-full h-16 bg-yellow-200 text-black flex items-center justify-center mt-20 mb-8">
          <p className="text-center">
            Trường học hiện đang ở ché độ{" "}
            <strong className="text-rose-500">TẠM ẨN</strong>. Vui lòng đổi chế
            độ để hiển thị trường.
          </p>
        </div>
      )}
      <div
        className={cn(
          "size-full [perspective:1000px] relative b flex flex-col mx-auto items-start justify-star",
          school.isPublished && "pt-20"
        )}
      >
        <SchoolTabs tabs={tabs} />
      </div>
    </>
  );
};

export default SchoolIdPage;
