import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AnimatedSignInButton from "./ui/AnimatedSignInButton";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <AnimatedSignInButton />
    </main>
  );
}
