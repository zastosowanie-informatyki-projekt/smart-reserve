import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getFloorPlan } from "@/server/rooms/actions/get-floor-plan";
import { getRooms } from "@/server/rooms/actions/get-rooms";
import { FloorPlanEditor } from "./_components/floor-plan-editor";

export default async function FloorPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  const { id } = await params;

  const isOwner = await prisma.restaurant.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true, name: true },
  });
  const isEmployee = !isOwner
    ? await prisma.restaurantEmployee.findFirst({
        where: { restaurantId: id, userId: session.user.id },
        select: { id: true },
      })
    : null;

  if (!isOwner && !isEmployee) {
    redirect("/dashboard");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!restaurant) {
    notFound();
  }

  const [floorPlanResult, roomsResult] = await Promise.all([
    getFloorPlan(id),
    getRooms(id),
  ]);

  const roomsWithFloorPlan = floorPlanResult.success ? floorPlanResult.data : [];
  const rooms = roomsResult.success ? roomsResult.data : [];

  return (
    <FloorPlanEditor
      restaurantId={id}
      restaurantName={restaurant.name}
      roomsWithFloorPlan={roomsWithFloorPlan}
      rooms={rooms}
    />
  );
}
