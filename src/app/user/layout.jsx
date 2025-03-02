"use client";
import Menu from "@/components/admin/menu";
import Navbar from "@/components/user/navbar";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Remove layout for the "test" page
  if (pathname === "/user/test") {
    return <> {children}</>;
  }

  if (pathname === "/user/full-test") {
    return <> {children}</>;
  }

  return (
    <div className="flex h-screen relative">
      {/* Left Side */}
      <div className="lg:w-[16%] w-[14%] md:w-[10%] p-6 sidebar">
        <div className="bg-white rounded-md p-5">
          <Image src={"/images/logo/logo.png"} alt="" width={150} height={80} />
        </div>
        <header>
          <Menu />
        </header>
      </div>

      {/* Right Side */}
      <div className="w-[86%] md:w-[90%] lg:w-[84%] xl:w-[84%] p-10 overflow-y-scroll no-scrollbar ">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
