"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UpdateSchoolLocationFormValues } from "@/data/schemas/form-schema";
import { useDisableComponents } from "@/hooks/use-disable-components";
import { useEdgeStore } from "@/lib/edgestore";
import { SingleFileDropzone } from "@/types/generic";
import { useState } from "react";
import { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { BackgroundDropzone } from "../background-dropzone";

type Props = {
  locationIndex: number;
  control: Control<UpdateSchoolLocationFormValues>;
  setValue: UseFormSetValue<UpdateSchoolLocationFormValues>;
  getValues: UseFormGetValues<UpdateSchoolLocationFormValues>;
  btnClass?: string;
};

export const UpdateSchoolLocationCover = ({
  locationIndex,
  control,
  setValue,
  getValues,
  btnClass,
}: Props) => {
  const [cover, setCover] = useState<SingleFileDropzone>();
  const [uploadingCover, setUploadingCover] = useState(false);
  const { edgestore } = useEdgeStore();
  const { isDisabled, toggleDisabled } = useDisableComponents();

  const onSelectedCover = async (index: number, value?: SingleFileDropzone) => {
    if (value?.file && value.file instanceof File) {
      setCover(value);
      setUploadingCover(true);
      toggleDisabled();
      try {
        await edgestore.publicFiles
          .upload({
            file: value.file,
          })
          .then((res) => {
            if (res.url) {
              setCover({ file: res.url });
              setValue(`locations.${index}.cover`, res.url);
            }
            if (!res.url) {
              toast.error("Có lỗi xảy ra khi tải ảnh lên");

              setCover(undefined);
            }
          })
          .finally(() => {
            setUploadingCover(false);
            toggleDisabled();
          });
      } catch (error) {
        console.error(error);

        setCover(undefined);
        setUploadingCover(false);

        toast.error("Có lỗi xảy ra khi tải ảnh lên");
      }
    }

    if (isDisabled) {
      toggleDisabled();
    }
  };

  return (
    <FormField
      control={control}
      name={`locations.${locationIndex}.cover`}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <FormLabel className="text-main dark:text-main-foreground">
            Ảnh bìa cơ sở
          </FormLabel>
          {uploadingCover ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-main/90 dark:border-main-foreground/90"></div>
            </div>
          ) : (
            <FormControl>
              <BackgroundDropzone
                disabled={control._formState.isSubmitting || uploadingCover}
                value={{ file: field.value } || cover}
                onChange={(file) => {
                  if (file) {
                    onSelectedCover(locationIndex, { file });
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
                field.onChange("");
                setCover(undefined);
              }}
              className={btnClass}
            >
              Xóa ảnh bìa
            </Button>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
