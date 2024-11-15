import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardNav from "../ui/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authObject: SignedInAuthObject = await auth();

  if (!authObject.userId) {
    redirect("/");
  }

  return (
    <div className="dark">
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
