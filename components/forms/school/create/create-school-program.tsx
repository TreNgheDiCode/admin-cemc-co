"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateSchoolFormValues } from "@/data/schemas/form-schema";
import { cn } from "@/lib/utils";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { ManageSchoolProgramCover } from "./manage-school-program-cover";
import { ManageSchoolProgramImages } from "./manage-school-program-images";

type Props = {
  control: Control<CreateSchoolFormValues>;
  errors: FieldErrors<CreateSchoolFormValues>;
  setValue: UseFormSetValue<CreateSchoolFormValues>;
  getValues: UseFormGetValues<CreateSchoolFormValues>;
};
export const CreateSchoolProgram = ({
  control,
  errors,
  setValue,
  getValues,
}: Props) => {
  const { append, remove, fields } = useFieldArray({
    control,
    name: `programs`,
  });

  const buttonClass =
    "bg-main dark:bg-main-component text-white dark:text-main-foreground hover:bg-main/70 dark:hover:bg-main-component/70";

  return (
    <>
      {fields.map((field, index) => (
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
                errors?.programs?.[index] && "text-red-700"
              )}
            >
              {`Chương trình đào tạo ${index + 1}`}

              <div className="absolute right-8">
                <Trash2Icon className="size-4" onClick={() => remove(index)} />
              </div>
              {errors?.programs?.[index] && (
                <span className="absolute alert right-8">
                  <AlertTriangleIcon className="h-4 w-4   text-red-700" />
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ManageSchoolProgramCover
                  control={control}
                  programIndex={index}
                  setValue={setValue}
                  getValues={getValues}
                  btnClass={buttonClass}
                />
                <div className="size-full space-y-4">
                  <FormField
                    control={control}
                    name={`programs.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main dark:text-main-foreground">
                          Tên chương trình đào tạo
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={control._formState.isSubmitting}
                            {...field}
                            placeholder="Nhập tên chương trình đào tạo"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`programs.${index}.description`}
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
                </div>
                <ManageSchoolProgramImages
                  programIndex={index}
                  control={control}
                  setValue={setValue}
                  getValues={getValues}
                  btnClass={buttonClass}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
      <div className="flex justify-center items-center mt-4">
        <button
          disabled={control._formState.isSubmitting}
          type="button"
          onClick={() => {
            append({
              cover: "",
              name: "",
              description: "",
            });
          }}
          className="px-4 py-2 rounded-md border border-main dark:border-main-component font-bold bg-main dark:bg-main-component text-white dark:text-main-foreground text-sm hover:shadow-[4px_4px_0px_0px_rgba(125, 31, 31)] transition duration-200"
        >
          Thêm chương trình đào tạo khác
        </button>
      </div>
    </>
  );
};
