import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UpdateAccountFormValues } from "@/data/schemas/update-account-schema";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react";
import { Control, UseFormWatch } from "react-hook-form";

type Props = {
  control: Control<UpdateAccountFormValues>;
  watch: UseFormWatch<UpdateAccountFormValues>;
};

export const AccountInputs = ({ control, watch }: Props) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  return (
    <div className="container mx-auto mt-10">
      <h1 className="my-2 text-center text-lg font-semibold text-main dark:text-main-foreground md:text-xl lg:text-3xl xl:text-5xl">
        Tài khoản người dùng
      </h1>
      <p className="text-center text-sm font-semibold italic text-rose-600 underline lg:text-base">
        *Vui lòng ghi nhớ những nội dung đã nhập để phục vụ cho việc truy cập
        tài khoản sau này*
      </p>
      <div className="mx-auto my-4 h-1 w-[30vw] bg-main dark:bg-main-foreground" />
      <div className="mx-auto max-w-4xl space-y-6">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-main dark:text-main-foreground">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập email của bạn..."
                  {...field}
                  className="text-primary dark:text-main-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
