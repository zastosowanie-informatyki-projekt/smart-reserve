import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const getDashboardAccess = async (restaurantId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const [ownedRestaurant, employeeRecord] = await Promise.all([
    prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: session.user.id },
      select: { id: true },
    }),
    prisma.restaurantEmployee.findFirst({
      where: { restaurantId, userId: session.user.id },
      select: { id: true },
    }),
  ]);

  if (!ownedRestaurant && !employeeRecord) {
    redirect("/dashboard");
  }

  return {
    session,
    isOwner: Boolean(ownedRestaurant),
  };
};
