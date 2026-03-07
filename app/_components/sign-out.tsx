import { signOut } from "@/auth";

export const SignOut = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="submit"
        className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
      >
        Sign out
      </button>
    </form>
  );
};
