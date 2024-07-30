import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export const metadata = {
  title: "Đăng nhập | CEMC Co,. Ltd",
  description: "Đăng nhập sử dụng tài khoản của bạn",
};

const LoginPage = () => {
  return (
    <>
      <Image fill alt="background" src={"/login.jpg"} className="blur-sm" />
      <div className="flex h-full w-full items-center justify-center">
        <SignIn fallbackRedirectUrl={"/"} />
      </div>
    </>
  );
};

export default LoginPage;
