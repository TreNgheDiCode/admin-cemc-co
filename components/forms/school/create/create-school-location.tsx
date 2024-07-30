"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CreateSchoolFormValues } from "@/data/form-schema";
import { cn } from "@/lib/utils";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { ManageLocationContacts } from "./manage-location-contacts";
import { ManageSchoolLocationCover } from "./manage-school-location-cover";
import { ManageSchoolLocationImages } from "./manage-school-location-images";

type Props = {
  control: Control<CreateSchoolFormValues>;
  errors: FieldErrors<CreateSchoolFormValues>;
  setValue: UseFormSetValue<CreateSchoolFormValues>;
  getValue: UseFormGetValues<CreateSchoolFormValues>;
};

export const CreateSchoolLocation = ({
  control,
  errors,
  setValue,
  getValue,
}: Props) => {
  const { append, remove, fields } = useFieldArray({
    control,
    name: `locations`,
  });

  const buttonClass =
    "bg-main dark:bg-main-component text-white dark:text-main-foreground";

  return (
    <>
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
                  <ManageSchoolLocationCover
                    control={control}
                    getValues={getValue}
                    locationIndex={index}
                    setValue={setValue}
                    btnClass={buttonClass}
                  />
                  <div className="space-y-4 size-ful">
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
                            Cơ sở chính sẽ được đánh màu đặc biệt và hiển thị ở
                            đầu trang trường học
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <ManageSchoolLocationImages
                    locationIndex={index}
                    control={control}
                    setValue={setValue}
                    getValues={getValue}
                    btnClass={buttonClass}
                  />
                  <div className="col-span-1 md:col-span-2">
                    <ManageLocationContacts
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
      <div className="flex justify-center items-center mt-4">
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
      </div>
    </>
  );
};
