import Image from "next/image";
import Link from "next/link";
import { title } from "process";

const navItem = [
  {
    title: "Menus",
    items: [
      {
        title: "Home",
        image: "/images/icons/home.png",
        herf: "/user/dashboard",
      },
      {
        title: "Learning Progress",
        image: "/images/icons/progress.png",
        herf: "",
      },
      {
        title: "Leader Board",
        image: "/images/icons/wining.png",
        herf: "",
      },
      {
        title: "FAQ’s",
        image: "/images/icons/faq.png",
        herf: "",
      },
      {
        title: "Settings",
        image: "/images/icons/settings.png",
        herf: "",
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
            <li key={item.title} className="flex justify-center md:justify-start items-center gap-3">
              <Image src={item.image} alt="" width={25} height={20} />
              <Link className="text-white hidden md:flex" href={item.herf}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    ))}
  </div>
);

export default Menu;
