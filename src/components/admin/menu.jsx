import Image from "next/image";
import Link from "next/link";
import { title } from "process";

const navItem = [
  {
    title: "Menus",
    items: [
      {
        title: "Dashboard",
        image: "/images/icons/home.png",
        herf: "/admin/dashboard",
      },
      {
        title: "Types",
        image: "/images/icons/news.png",
        herf: "/admin/types",
      },
      {
        title: "Upload",
        image: "/images/icons/progress.png",
        herf: "/admin/upload",
      },
      {
        title: "Questions",
        image: "/images/icons/wining.png",
        herf: "/admin/questions",
      },
     
      {
        title: "Settings",
        image: "/images/icons/settings.png",
        herf: "/admin/settings",
      },
    ],
  },
];

const Menu = () => (
  <div>
    {navItem.map((nav) => (
      <nav key={title}>
        <ul className="pt-16 grid gap-6">
          {nav.items.map((item) => (
            <li key={item.title} className="flex items-center gap-3">
              <Image src={item.image} alt="" width={25} height={20} />
              <Link className="text-white" href={item.herf}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    ))}
  </div>
);

export default Menu;
