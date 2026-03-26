import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFloorPlan } from "@/server/rooms/actions/get-floor-plan";
import { getRooms } from "@/server/rooms/actions/get-rooms";
import { FloorPlanEditor } from "./_components/floor-plan-editor";
import { getDashboardAccess } from "../_lib/get-dashboard-access";

export default async function FloorPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await getDashboardAccess(id);

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
