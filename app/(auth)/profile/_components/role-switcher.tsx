"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/server/auth/actions/set-user-role";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = "USER" | "RESTAURANT_OWNER" | "EMPLOYEE";

const ROLE_LABEL: Record<UserRole, string> = {
  USER: "User",
  RESTAURANT_OWNER: "Restaurant Owner",
  EMPLOYEE: "Employee",
};

export const RoleSwitcher = ({ currentRole }: { currentRole: UserRole }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isUnchanged = selectedRole === currentRole;

  const handleChangeRole = () => {
    setError(null);
    setSuccess(null);

    if (isUnchanged) {
      return;
    }

    startTransition(async () => {
      const result = await setUserRole(selectedRole);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("Role updated successfully.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">Change role</p>
        <p className="text-sm text-muted-foreground">
          You can switch roles only when there is no active data linked to your current role.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as UserRole)}
          disabled={isPending}
        >
          <SelectTrigger className="h-10 w-full sm:w-64">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">{ROLE_LABEL.USER}</SelectItem>
            <SelectItem value="RESTAURANT_OWNER">{ROLE_LABEL.RESTAURANT_OWNER}</SelectItem>
            <SelectItem value="EMPLOYEE">{ROLE_LABEL.EMPLOYEE}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={handleChangeRole}
          disabled={isPending || isUnchanged}
          className="sm:w-auto"
        >
          {isPending ? "Saving..." : "Save role"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
    </div>
  );
};
