import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { OnboardingForm } from "./_components/onboarding-form";

export const metadata = {
  title: "Welcome | TableSpot",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  });

  if (user?.onboarded) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg items-center px-4">
      <OnboardingForm userName={session.user.name} />
    </div>
  );
}
