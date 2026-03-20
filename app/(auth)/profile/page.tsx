import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher } from "./_components/role-switcher";

export const metadata = {
  title: "Profile | TableSpot",
};

const ROLE_LABEL: Record<string, string> = {
  USER: "User",
  RESTAURANT_OWNER: "Restaurant Owner",
  EMPLOYEE: "Employee",
};

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  USER: "outline",
  RESTAURANT_OWNER: "default",
  EMPLOYEE: "secondary",
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const role = session.user.role;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name}
                className="h-16 w-16 rounded-full"
              />
            )}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{session.user.name}</p>
                <Badge variant={ROLE_VARIANT[role] ?? "outline"}>
                  {ROLE_LABEL[role] ?? role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Settings</CardTitle>
          <CardDescription>Update how you use TableSpot</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleSwitcher currentRole={role} />
        </CardContent>
      </Card>
    </div>
  );
}
