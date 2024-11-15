import "@/app/ui/global.css";
export const experimental_ppr = true;
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "./ui/theme-toggle";

export const metadata: Metadata = {
  title: {
    template: "%s | Dashboard",
    default: "Dashboard",
  },
  description: "2 is better than 1",
  metadataBase: new URL("https://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <ClerkProvider>{children}</ClerkProvider>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
