"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { DegreeType, Gender, GradeType, StudentStatus } from "@prisma/client";
import { GetAccountById } from "@/data/accounts";
import { ChipProps } from "@nextui-org/chip";
import { Card, CardBody } from "@nextui-org/card";
import { Avatar } from "@nextui-org/avatar";
import { InformationHolder } from "./information-holder";

type AccountInformationProps = {
  account: Awaited<ReturnType<typeof GetAccountById>>;
};

const statusColorMap: Record<StudentStatus, ChipProps["color"]> = {
  AWAITING: "default",
  STUDYING: "warning",
  APPROVED: "success",
  DROPPED: "danger",
};

const genderLabelMap: Record<Gender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
};

const degreeLabelMap: Record<DegreeType, string> = {
  UNIVERSITY: "Đại học",
  HIGHSCHOOL: "Trung học phổ thông",
};

export const AccountInformation = ({
  account,
}: Readonly<AccountInformationProps>) => {
  if (!account || !account.student)
    return (
      <div className="flex items-center justify-center font-bold text-3xl text-main dark:text-main-foreground">
        Thông tin tài khoản không tồn tại
      </div>
    );

  return (
    <Card>
      <CardBody>
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4 divide-x-3">
          <div className="flex flex-col gap-3">
            <Avatar
              color={statusColorMap[account.student.status]}
              alt="avatar"
              isBordered
              className="w-24 h-24"
              src={account.image ?? "/logo_icon_light.png"}
            />
            <h1 className="font-bold text-[#7D1F1F] dark:text-primary">
              Thông tin tài khoản
            </h1>
            <InformationHolder
              label="Mã học sinh"
              data={account.student.studentCode}
            />
            <InformationHolder label="Họ và tên" data={account.name} />
            <InformationHolder
              label="Giới tính"
              data={genderLabelMap[account.gender]}
            />
            <InformationHolder
              label="Ngày sinh"
              data={format(account.dob, "dd MMMM, yyyy", {
                locale: vi,
              })}
            />
            <InformationHolder label="CMND/CCCD" data={account.idCardNumber} />
            <InformationHolder label="Email" data={account.email} />
            <InformationHolder
              label="Địa chỉ liên lạc"
              data={account.address}
            />
          </div>
          <div className="pl-3 flex flex-col gap-3">
            <h1 className="font-bold text-[#7D1F1F] dark:text-primary">
              Thông tin đào tạo
            </h1>
            <InformationHolder
              label="Trường học"
              data={account.student.school.name}
            />
            <InformationHolder
              label="Ngành đào tạo"
              data={account.student.program?.program.name}
            />
            <InformationHolder
              label="Cơ sở"
              data={account.student.location?.location.name}
            />
            <InformationHolder
              label="Địa chỉ cơ sở chính"
              data={account.student.location?.location.address}
            />
            <InformationHolder label="Lớp" />
            <InformationHolder
              label="Điểm trung bình tích lũy (Hồ sơ)"
              data={`${account.student.gradeScore} (${
                account.student.gradeType === GradeType.CGPA ? "CGPA" : "GPA"
              })`}
            />
            <InformationHolder
              label="Chứng chỉ ngoại ngữ"
              data={account.student.certificateType}
            />
            <InformationHolder
              label="Trình độ học tập"
              data={account.student.degreeType}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
