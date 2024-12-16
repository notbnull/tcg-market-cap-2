import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Catalog", href: "/dashboard/catalog" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-4">
        {links.map((link) => {
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium",
                {
                  "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white":
                    pathname === link.href,
                }
              )}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
