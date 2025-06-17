"use client";
import Menu from "@/components/user/menu";
import UserComponent from "@/components/user/navbar";
import BannerComponent  from "@/components/user/BannerComponent";
import Image from "next/image";
import { usePathname } from "next/navigation";
import useAuth from "@/contexts/useAuth";
export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  useAuth();
  // Remove layout for the "test" page
  if (pathname === "/user/test") {
    return <> {children}</>;
  }

  if (pathname === "/user/flipbook") {
    return <> {children}</>;
  }

  if (pathname === "/user/practice") {
    return <> {children}</>;
  }

  return (
    <div className="flex h-screen overflow-y-hidden relative">
      {/* Left Side */}
      <div className=" w-[14%] md:w-[10%] lg:w-[16%] xl:[14%] md:p-6 p-2 pt-10 sidebar hidden md:block">
        <div className="bg-white rounded-md hidden md:flex md:p-5">
          <Image src={"/images/logo/logo.png"} alt="" width={150} height={80} />
        </div>
        <div className="bg-white rounded-md md:hidden ">
          <Image src={"/images/logo/logo1.png"} alt="" width={150} height={80} />
        </div>
        <header>
          <Menu />
        </header>
      </div>

      {/* Right Side */}

      <div className="w-[100%] md:w-[90%] lg:w-[84%] xl:w-[84%]  overflow-y-scroll no-scrollbar ">
        <div className="p-4 md:p-10">
        <div className="flex items-center justify-between md:justify-end ">
          <div className="flex md:hidden items-center ">
            <Image
              src="/images/logo/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <Menu />
          </div>


          <UserComponent />
        </div>
        <BannerComponent />
        {children}
</div>
          <footer className="w-full bg-white p-4 pt-0 text-center text-gray-600 ">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} mitoslearning.com. All rights reserved.
        </p>
      </footer>
      </div>

    
    </div>
  );
}
