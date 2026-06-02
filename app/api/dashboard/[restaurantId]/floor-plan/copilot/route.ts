import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { UIMessage } from "ai";
import { floorPlanCopilotContextSchema } from "@/lib/floor-plan-copilot/types";
import { floorPlanCopilotAgent } from "@/server/rooms/ai/floor-plan-copilot-agent";

async function assertDashboardAccess(restaurantId: string): Promise<Response | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  if (!process.env.GROQ_API_KEY?.trim()) {
    return Response.json({ error: "GROQ_API_KEY is not configured" }, { status: 503 });
  }

  const { restaurantId } = await params;
  const accessError = await assertDashboardAccess(restaurantId);
  if (accessError) return accessError;

  const body = (await req.json()) as {
    messages: UIMessage[];
    context: unknown;
  };

  const parsedContext = floorPlanCopilotContextSchema.safeParse(body.context);
  if (!parsedContext.success) {
    return Response.json({ error: "Invalid floor plan context" }, { status: 400 });
  }

  if (!body.messages?.length) {
    return Response.json({ error: "Messages are required" }, { status: 400 });
  }

  return floorPlanCopilotAgent.run({
    messages: body.messages,
    context: parsedContext.data,
  });
}
