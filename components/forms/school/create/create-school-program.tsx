"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateSchoolFormValues } from "@/data/form-schema";
import { useEdgeStore } from "@/lib/edgestore";
import { cn } from "@/lib/utils";
import { SingleFileDropzone } from "@/types/generic";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { toast } from "sonner";
import { LogoDropzone } from "../logo-dropzone";
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

  const { edgestore } = useEdgeStore();
  const [cover, setCover] = useState<SingleFileDropzone>();
  const [uploadingCover, setUploadingCover] = useState(false);

  const onSelectedCover = async (index: number, value?: SingleFileDropzone) => {
    if (value?.file && value.file instanceof File) {
      setCover(value);
      setUploadingCover(true);
      try {
        await edgestore.publicFiles
          .upload({
            file: value.file,
          })
          .then((res) => {
            if (res.url) {
              setCover({ file: res.url });
              setValue(`programs.${index}.cover`, res.url);
            }
            if (!res.url) {
              toast.error("Có lỗi xảy ra khi tải ảnh lên");

              setCover(undefined);
            }
          })
          .finally(() => setUploadingCover(false));
      } catch (error) {
        console.error(error);

        setCover(undefined);
        setUploadingCover(false);

        toast.error("Có lỗi xảy ra khi tải ảnh lên");
      }
    }
  };

  const buttonClass =
    "bg-main dark:bg-main-component text-white dark:text-main-foreground";

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
              {`Ngành đào tạo ${index + 1}`}

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
                <div className="size-full">
                  <FormField
                    control={control}
                    name={`programs.${index}.cover`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel className="text-main dark:text-main-foreground">
                          Ảnh đại diện
                        </FormLabel>
                        {uploadingCover ? (
                          <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-main/90 dark:border-main-foreground/90"></div>
                          </div>
                        ) : (
                          <FormControl>
                            <LogoDropzone
                              disabled={
                                control._formState.isSubmitting ||
                                uploadingCover
                              }
                              value={{ file: field.value } || cover}
                              onChange={(file) => {
                                if (file) {
                                  onSelectedCover(index, { file });
                                }
                              }}
                            />
                          </FormControl>
                        )}
                        {field.value && (
                          <Button
                            disabled={
                              control._formState.isSubmitting || uploadingCover
                            }
                            size="sm"
                            onClick={() => {
                              field.onChange(undefined);
                              setCover(undefined);
                            }}
                            className={buttonClass}
                          >
                            Xóa ảnh đại diện
                          </Button>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="size-full space-y-4">
                  <FormField
                    control={control}
                    name={`programs.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main dark:text-main-foreground">
                          Tên ngành đào tạo
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={control._formState.isSubmitting}
                            {...field}
                            placeholder="Nhập tên ngành đào tạo"
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
          Thêm ngành đào tạo khác
        </button>
      </div>
    </>
  );
};
