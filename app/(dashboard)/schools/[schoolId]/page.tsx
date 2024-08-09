import Loading from "@/components/loading";
import { SchoolGalleries } from "@/components/schools/school-galleries";
import { SchoolInformation } from "@/components/schools/school-information";
import { SchoolLocations } from "@/components/schools/school-locations";
import { SchoolPrograms } from "@/components/schools/school-programs";
import { SchoolTabs } from "@/components/schools/school-tabs";
import { SchoolWrapper } from "@/components/schools/school-wrapper";
import { StudentSchoolTable } from "@/components/tables/schools/student-school-table";
import { GetSchools } from "@/data/schools";
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

const SchoolIdPage = ({ params }: Props) => {
  const tabs: TabItem[] = [
    {
      title: "Thông tin",
      value: "info",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl shadow-md border">
          <SchoolInformation schoolId={params.schoolId} />
        </div>
      ),
    },
    {
      title: "Học sinh",
      value: "students",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <StudentSchoolTable schoolId={params.schoolId} />
        </div>
      ),
    },
    {
      title: "Cơ sở",
      value: "teachers",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <SchoolLocations schoolId={params.schoolId} />
        </div>
      ),
    },
    {
      title: "Chương trình đào tạo",
      value: "courses",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <SchoolPrograms schoolId={params.schoolId} />
        </div>
      ),
    },
    {
      title: "Bộ sưu tập",
      value: "galleries",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          <SchoolGalleries schoolId={params.schoolId} />
        </div>
      ),
    },
    {
      title: "Học bổng",
      value: "scholarships",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          Học bổng
        </div>
      ),
    },
    {
      title: "Tin tức",
      value: "news",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          Tin tức
        </div>
      ),
    },
    {
      title: "Phản hồi & Góp ý",
      value: "supports",
      content: (
        <div className="w-full overflow-y-scroll relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold dark:text-main-foreground bg-main-foreground dark:bg-main-component">
          Phản hồi & Góp ý
        </div>
      ),
    },
  ];

  return (
    <>
      <Suspense fallback={<Loading />}>
        <SchoolWrapper schoolId={params.schoolId}>
          <SchoolTabs tabs={tabs} />
        </SchoolWrapper>
      </Suspense>
    </>
  );
};

export default SchoolIdPage;
