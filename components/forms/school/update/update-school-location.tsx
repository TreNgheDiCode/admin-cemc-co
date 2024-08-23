"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  UpdateSchoolLocationFormValues,
  UpdateSchoolLocationSchema,
} from "@/data/schemas/form-schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { UpdateLocationContacts } from "./update-location-contacts";
import { UpdateSchoolLocationCover } from "./update-school-location-cover";
import { UpdateSchoolLocationImages } from "./update-school-location-images";
import { useState } from "react";
import { UpdateSchoolLocations } from "@/action/school";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  initialData: UpdateSchoolLocationFormValues;
  schoolId: string;
};

export const UpdateSchoolLocation = ({ initialData, schoolId }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<UpdateSchoolLocationFormValues>({
    resolver: zodResolver(UpdateSchoolLocationSchema),
    mode: "all",
    defaultValues: {
      locations: initialData.locations,
    },
  });

  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = form;

  const { append, remove, fields } = useFieldArray({
    control,
    name: `locations`,
  });

  const buttonClass =
    "bg-main dark:bg-main-component text-white dark:text-main-foreground";

  const onSubmit = async (values: UpdateSchoolLocationFormValues) => {
    setLoading(true);
    await UpdateSchoolLocations(schoolId, values)
      .then((res) => {
        if (res.success) {
          toast.success(res.success);
          router.push(`/schools/${schoolId}`);
          router.refresh();
        } else if (res.error) {
          toast.error(res.error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          return (
            <Accordion
              key={field.id}
              type="single"
              collapsible
              defaultValue="item-1"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger
                  className={cn(
                    "[&[data-state=closed]>button]:hidden [&[data-state=open]>.alert]:hidden relative !no-underline",
                    errors?.locations?.[index] && "text-red-700"
                  )}
                >
                  {`Cơ sở ${index + 1}`}

                  <div className="absolute right-8">
                    <Trash2Icon
                      className="size-4"
                      onClick={() => remove(index)}
                    />
                  </div>
                  {errors?.locations?.[index] && (
                    <span className="absolute alert right-8">
                      <AlertTriangleIcon className="h-4 w-4   text-red-700" />
                    </span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UpdateSchoolLocationCover
                      control={control}
                      getValues={getValues}
                      locationIndex={index}
                      setValue={setValue}
                      btnClass={buttonClass}
                    />
                    <div className="space-y-4 size-full">
                      <FormField
                        control={control}
                        name={`locations.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-main dark:text-main-foreground">
                              Tên cơ sở
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={control._formState.isSubmitting}
                                {...field}
                                placeholder="Nhập tên cơ sở"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`locations.${index}.address`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-main dark:text-main-foreground">
                              Địa chỉ cơ sở
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={control._formState.isSubmitting}
                                {...field}
                                placeholder="Nhập địa chỉ cơ sở"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`locations.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-main dark:text-main-foreground">
                              Mô tả
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                disabled={control._formState.isSubmitting}
                                {...field}
                                placeholder="Nhập mô tả"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`locations.${index}.isMain`}
                        render={({ field }) => (
                          <FormItem className="space-y-2 flex flex-col gap-y-3">
                            <FormLabel className="text-main dark:text-main-foreground">
                              Cơ sở chính?
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Cơ sở chính sẽ được đánh màu đặc biệt và hiển thị
                              ở đầu trang trường học
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <UpdateSchoolLocationImages
                      locationIndex={index}
                      control={control}
                      setValue={setValue}
                      getValues={getValues}
                      btnClass={buttonClass}
                    />
                    <div className="col-span-1 md:col-span-2">
                      <UpdateLocationContacts
                        locationIndex={index}
                        control={control}
                        errors={errors}
                        setValue={setValue}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
        <div className="flex justify-center items-center gap-6 mt-4">
          <button
            disabled={control._formState.isSubmitting}
            type="button"
            onClick={() => {
              append({
                cover: "",
                name: "",
                address: "",
                isMain: false,
              });
            }}
            className="px-4 py-2 rounded-md border border-main dark:border-main-component font-bold bg-main dark:bg-main-component text-white dark:text-main-foreground text-sm hover:shadow-[4px_4px_0px_0px_rgba(125, 31, 31)] transition duration-200"
          >
            Thêm cơ sở khác
          </button>
          <button
            disabled={control._formState.isSubmitting}
            type="submit"
            className="px-4 py-2 rounded-md border border-main dark:border-main-component font-bold bg-main dark:bg-main-component text-white dark:text-main-foreground text-sm hover:shadow-[4px_4px_0px_0px_rgba(125, 31, 31)] transition duration-200"
          >
            Cập nhật cơ sở
          </button>
        </div>
      </form>
    </Form>
  );
};
