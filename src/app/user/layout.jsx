"use client";
import Menu from "@/components/user/menu";
import Navbar from "@/components/user/navbar";
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

  if (pathname === "/user/full-test") {
    return <> {children}</>;
  }

  return (
    <div className="flex h-screen relative">
      {/* Left Side */}
      <div className=" w-[14%] md:w-[10%] lg:w-[16%] xl:[14%] md:p-6 p-2 pt-10 sidebar ">
        <div className="bg-white rounded-md hidden md:flex md:p-5">
        <Image src={"/images/logo/logo.png"} alt="" width={150} height={80} />
        </div>
        <div className="bg-white rounded-md md:hidden ">
        <Image src={"/images/logo/logo1.png"} alt="" width={150} height={80} />
        </div>
        <header>
<Menu/>
        </header>
      </div>

      {/* Right Side */}
      <div className="w-[86%] md:w-[90%] lg:w-[84%] xl:w-[84%] p-4 md:p-10 overflow-y-scroll no-scrollbar ">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
