"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { searchUsersToInvite } from "@/server/invitations/actions/search-users-to-invite";
import { sendInvitation } from "@/server/invitations/actions/send-invitation";
import { getInvitations } from "@/server/invitations/actions/get-invitations";
import { revokeInvitation } from "@/server/invitations/actions/revoke-invitation";
import { getEmployees } from "@/server/employees/actions/get-employees";
import { removeEmployee } from "@/server/employees/actions/remove-employee";
import { Trash2, UserPlus, Search, Mail } from "lucide-react";

type Employee = {
  id: string;
  createdAt: Date;
  user: { id: string; name: string; email: string; image: string | null };
};

type SearchResult = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type PendingInvitation = {
  id: string;
  createdAt: Date;
  user: { id: string; name: string; email: string; image: string | null };
};

export const EmployeeManagement = ({
  restaurantId,
}: {
  restaurantId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    getEmployees(restaurantId).then((r) => {
      if (r.success) setEmployees(r.data);
    });
    getInvitations(restaurantId).then((r) => {
      if (r.success) setInvitations(r.data);
    });
  };

  useEffect(() => {
    refresh();
  }, [restaurantId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const r = await searchUsersToInvite(query, restaurantId);
      if (r.success) {
        setResults(r.data);
        setShowResults(true);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, restaurantId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInvite = (userId: string) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("restaurantId", restaurantId);
      formData.set("userId", userId);
      const r = await sendInvitation(formData);
      if (r.success) {
        setQuery("");
        setResults([]);
        setShowResults(false);
        refresh();
      } else {
        setError(r.error);
      }
    });
  };

  const handleRevoke = (invitationId: string) => {
    startTransition(async () => {
      const r = await revokeInvitation(invitationId, restaurantId);
      if (r.success) refresh();
    });
  };

  const handleRemove = (employeeId: string) => {
    startTransition(async () => {
      await removeEmployee(employeeId, restaurantId);
      refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>
          Invite employees to manage this restaurant. They must accept the
          invitation first.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {employees.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Current Employees</p>
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {emp.user.image ? (
                    <img
                      src={emp.user.image}
                      alt={emp.user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {emp.user.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{emp.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(emp.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {invitations.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Pending Invitations</p>
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-dashed p-3"
              >
                <div className="flex items-center gap-3">
                  {inv.user.image ? (
                    <img
                      src={inv.user.image}
                      alt={inv.user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {inv.user.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{inv.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.user.email}
                    </p>
                  </div>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRevoke(inv.id)}
                  disabled={isPending}
                  title="Revoke invitation"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <p className="text-sm font-medium">Invite Employee</p>
          <div ref={containerRef} className="relative">
            <label htmlFor="employee-search" className="sr-only">
              Search employees to invite
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="employee-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                placeholder="Search by name or email (min 2 chars)..."
                className="pl-9"
              />
            </div>
            {showResults && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                {results.length === 0 ? (
                  <p className="p-3 text-center text-sm text-muted-foreground">
                    No users found. They must have the Employee role.
                  </p>
                ) : (
                  results.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleInvite(user.id)}
                      disabled={isPending}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-7 w-7 rounded-full"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {user.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
