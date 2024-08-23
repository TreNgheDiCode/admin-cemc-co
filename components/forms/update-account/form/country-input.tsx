"use client";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Chip } from "@nextui-org/chip";
import { Country } from "@prisma/client";
import Image from "next/image";
import ReactCountryFlag from "react-country-flag";

type Props = {
  country?: string;
};

const schoolItems = [
  {
    value: Country.CANADA,
    name: "Canada",
    description:
      "Xứ sở lá phong đỏ với thiên nhiên hùng vĩ, là một bức tranh đa sắc tộc, nơi hòa quyện nhiều nền văn hóa khác nhau, tạo nên một xã hội cởi mở, thân thiện và phát triển.",
    src: "/canada-bg.jpg",
    flag: <ReactCountryFlag countryCode="CA" className="size-12" svg />,
  },
  {
    value: Country.AUSTRALIA,
    name: "Australia",
    description:
      "Xứ sở chuột túi với những bãi biển dài, nắng ấm quanh năm, là nơi lý tưởng cho những ai yêu thích văn hóa nước Úc, muốn trải nghiệm cuộc sống mới và học tập tại một trong những quốc gia phát triển hàng đầu thế giới.",
    src: "/australia-bg.jpg",
    flag: <ReactCountryFlag countryCode="AU" className="size-12" svg />,
  },
  {
    value: Country.KOREA,
    name: "Hàn Quốc",
    description:
      "Hàn Quốc - xứ sở của những bộ phim Hàn Quốc nổi tiếng, nơi đây còn có nền giáo dục phát triển, chất lượng cao và được đánh giá cao trên thế giới.",
    src: "/korea-bg.jpg",
    flag: <ReactCountryFlag countryCode="KR" className="size-12" svg />,
  },
];

export const CountryInput = ({ country }: Props) => {
  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-center text-lg font-semibold text-main dark:text-main-foreground md:text-xl lg:text-3xl xl:text-5xl">
        Quốc gia
      </h1>
      <div className="mx-auto my-4 h-1 w-[30vw] bg-main dark:bg-main-foreground" />
      <div className="mt-10 grid grid-cols-1 gap-y-6 md:grid-cols-2">
        {schoolItems.map((item) => (
          <SchoolItem
            country={country ?? ""}
            key={item.name}
            value={item.value}
            name={item.name}
            description={item.description}
            src={item.src}
            flag={item.flag}
          />
        ))}
      </div>
    </div>
  );
};

type SchoolItem = {
  value: Country;
  name: string;
  description: string;
  src: string;
  flag: React.ReactNode | JSX.Element;
  country: string;
};

const SchoolItem = ({
  value,
  country,
  name,
  description,
  src,
  flag,
}: SchoolItem) => {
  return (
    <CardContainer className="inter-var">
      <CardBody className="group/card relative h-auto w-auto rounded-xl border border-black/[0.1] bg-gray-50 p-6 dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] sm:w-[30rem]">
        <CardItem
          translateZ="50"
          className="flex w-full items-center justify-between gap-2.5 text-xl font-bold text-main dark:text-main-foreground"
        >
          {"Quốc gia: " + name}
          {flag}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="mt-2 line-clamp-3 max-w-sm text-sm text-neutral-500 dark:text-neutral-300"
        >
          {description}
        </CardItem>
        <CardItem translateZ="100" className="mt-4 w-full">
          <Image
            src={src}
            height="1000"
            width="1000"
            priority
            quality={100}
            className="h-60 w-full rounded-xl object-cover group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        {country === value && (
          <div className="mt-20 flex items-center justify-center">
            <Chip color="success" className="cursor-default">
              Đã chọn
            </Chip>
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
};
