import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignIn } from "./_components/sign-in";
import { SignOut } from "./_components/sign-out";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-8 shadow dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">Auth Test</h1>

        {session?.user ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Signed in as</p>
              <p className="text-lg font-medium text-black dark:text-zinc-50">{session.user.name}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{session.user.email}</p>
            </div>

            {session.user.image && (
              <img src={session.user.image} alt="Avatar" className="h-16 w-16 rounded-full" />
            )}

            <pre className="overflow-auto rounded bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {JSON.stringify(session, null, 2)}
            </pre>

            <SignOut />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">You are not signed in.</p>
            <SignIn />
          </div>
        )}
      </main>
    </div>
  );
}
