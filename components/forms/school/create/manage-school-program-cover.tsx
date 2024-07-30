"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreateSchoolFormValues } from "@/data/form-schema";
import { useEdgeStore } from "@/lib/edgestore";
import { SingleFileDropzone } from "@/types/generic";
import { useState } from "react";
import { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { LogoDropzone } from "../logo-dropzone";

type Props = {
  programIndex: number;
  control: Control<CreateSchoolFormValues>;
  setValue: UseFormSetValue<CreateSchoolFormValues>;
  getValues: UseFormGetValues<CreateSchoolFormValues>;
  btnClass?: string;
};

export const ManageSchoolProgramCover = ({
  programIndex,
  control,
  setValue,
  getValues,
  btnClass,
}: Props) => {
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

  return (
    <FormField
      control={control}
      name={`programs.${programIndex}.cover`}
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
                disabled={control._formState.isSubmitting || uploadingCover}
                value={{ file: field.value } || cover}
                onChange={(file) => {
                  if (file) {
                    onSelectedCover(programIndex, { file });
                  }
                }}
              />
            </FormControl>
          )}
          {field.value && (
            <Button
              disabled={control._formState.isSubmitting || uploadingCover}
              size="sm"
              onClick={() => {
                field.onChange(undefined);
                setCover(undefined);
              }}
              className={btnClass}
            >
              Xóa ảnh đại diện
            </Button>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
