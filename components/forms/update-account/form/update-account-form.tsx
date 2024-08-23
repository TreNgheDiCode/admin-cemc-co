"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Country } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import StepperBar from "./stepper";
import { CountryInput } from "./country-input";
import { SubmitButtons } from "./submit-buttons";
import { SchoolInput } from "./school-input";
import { ProgramInput } from "./program-input";
import { Form } from "@/components/ui/form";
import { InformationInputs } from "./information-input";
import { EducationInputs } from "./education-inputs";
import { AccountInputs } from "./account-inputs";
import { PreviewUpdateAccount } from "../preview-update-account";
import { toast } from "sonner";
import { GetAccountById, GetSchoolsAuth } from "@/data/accounts";
import { updateAccount } from "@/action/account";
import {
  UpdateAccountFormValues,
  UpdateAccountSchema,
} from "@/data/schemas/update-account-schema";

type Props = {
  schools: Awaited<ReturnType<typeof GetSchoolsAuth>>;
  account: Awaited<ReturnType<typeof GetAccountById>>;
};

const UpdateAccountForm = ({ account, schools }: Props) => {
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UpdateAccountFormValues>();
  const router = useRouter();

  const accountAddressLine = account?.address.split(", ")[0];
  const accountWard = account?.address.split(", ")[1];
  const accountDistrict = account?.address.split(", ")[2];
  const accountCity = account?.address.split(", ")[3];

  const form = useForm<UpdateAccountFormValues>({
    mode: "all",
    resolver: zodResolver(UpdateAccountSchema),
    defaultValues: {
      name: account?.name,
      phoneNumber: account?.phoneNumber,
      dob: account?.dob,
      addressLine: accountAddressLine,
      ward: accountWard,
      district: accountDistrict,
      city: accountCity,
      certificateImg: account?.student?.certificateImg,
      degreeType: account?.student?.degreeType,
      certificateType: account?.student?.certificateType,
      gradeType: account?.student?.gradeType,
      gradeScore: account?.student?.gradeScore.toString(),
      email: account?.email,
      idCardNumber: account?.idCardNumber,
      gender: account?.gender,
      image: account?.image ?? "/logo_icon_light.png",
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const onSubmit = async () => {
    if (!data) return;
    setLoading(true);
    await updateAccount(account!.id, data)
      .then((res) => {
        if (res.success) {
          toast.success(res.success);
          router.push("/accounts");
        } else {
          toast.error(res.error);
        }
      })
      .finally(() => setLoading(false));
  };

  const processForm: SubmitHandler<UpdateAccountFormValues> = (data) => {
    setData(data);
  };

  type FieldName = keyof UpdateAccountFormValues;

  const filteredSchoolsByCountry =
    account?.student?.school.country && Array.isArray(schools)
      ? schools.filter(
          (school) => school.country === account?.student?.school.country
        )
      : [];

  const filteredProgramsBySchool =
    account?.student?.school.name && Array.isArray(schools)
      ? schools.find((school) => school.name === account?.student?.school.name)
          ?.programs
      : [];

  const steps = [
    {
      id: "Bước 1",
      name: account?.student?.school.country
        ? `Đã chọn: ${account?.student?.school.country}`
        : "Quốc gia du học",
      fields: [],
    },
    {
      id: "Bước 2",
      name: account?.student?.school.country
        ? `Đã chọn: ${account?.student?.school.name}`
        : "Trường học",
      fields: [],
    },
    {
      id: "Bước 3",
      name:
        account?.student?.program && account?.student?.program.program.name
          ? `Đã chọn: ${account?.student?.program.program.name}`
          : "Chương trình đào tạo",
      fields: [],
    },
    {
      id: "Bước 4",
      name: "Thông tin cá nhân",
      fields: [
        "name",
        "phoneNumber",
        "dob",
        "gender",
        "idCardNumber",
        "city",
        "district",
        "ward",
        "addressLine",
      ],
    },
    {
      id: "Bước 5",
      name: "Thông tin học vấn",
      fields: [
        "degreeType",
        "certificateType",
        "certificateImg",
        "gradeType",
        "gradeScore",
      ],
    },
    {
      id: "Bước 6",
      name: "Thông tin tài khoản",
      fields: ["email", "password", "confirmPassword"],
    },
    {
      id: "Bước 7",
      name: "Hoàn tất",
      fields: [],
    },
  ];

  const next = async () => {
    const fields = steps[currentStep]?.fields;

    const output = await form.trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await form.handleSubmit(processForm)();
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  const selectedSchool = schools.find(
    (school) => school.name === account?.student?.school.name
  );

  return (
    <div id="register-form size-full">
      <StepperBar steps={steps} currentStep={currentStep} />
      {currentStep === 0 && (
        <CountryInput country={account?.student?.school.country} />
      )}
      {currentStep === 1 && (
        <SchoolInput
          country={account?.student?.school.country as Country}
          school={account?.student?.school.name ?? ""}
          errors={errors}
          schools={filteredSchoolsByCountry}
        />
      )}
      {currentStep === 2 && (
        <ProgramInput
          programs={filteredProgramsBySchool ?? []}
          program={account?.student?.program?.program.name ?? ""}
        />
      )}
      <Form {...form}>
        <form>
          {currentStep === 3 && (
            <InformationInputs control={control} watch={watch} />
          )}
          {currentStep === 4 && (
            <EducationInputs
              control={control}
              watch={watch}
              setValue={setValue}
            />
          )}
          {currentStep === 5 && (
            <AccountInputs control={control} watch={watch} />
          )}
        </form>
      </Form>
      {/* Preview data */}
      {data && selectedSchool && currentStep === steps.length - 1 && (
        <PreviewUpdateAccount
          setValue={setValue}
          watch={watch}
          data={data}
          school={selectedSchool}
          programName={account?.student?.program?.program.name}
        />
      )}
      {!data && currentStep === steps.length - 1 && (
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-main dark:text-main-foreground">
            Lỗi hoàn tất thông tin hồ sơ
          </h1>
          <p className="text-neutral-500 dark:text-neutral-300">
            Vui lòng kiểm tra lại thông tin ở những bước trước đó
          </p>
        </div>
      )}
      <SubmitButtons
        currentStep={currentStep}
        data={data}
        loading={loading}
        next={next}
        onSubmit={handleSubmit(onSubmit)}
        prev={prev}
        stepsLength={steps.length}
      />
    </div>
  );
};

export default UpdateAccountForm;
