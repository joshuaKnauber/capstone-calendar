"use client";

import {
  User,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const onSignIn = async () => {
    const scopes = ["https://www.googleapis.com/auth/calendar"];
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: scopes.join(" "),
      },
    });
    router.refresh();
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setUser(null);
  };

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  if (loading) return <p>loading...</p>;

  if (user) {
    return (
      <main className="mt-24 flex flex-col items-center gap-4">
        <button onClick={onSignOut}>sign out</button>
        <img src={user.user_metadata.avatar_url} />
      </main>
    );
  }

  return (
    <main className="mt-24 flex flex-col items-center gap-4">
      <button onClick={onSignIn}>sign in</button>
    </main>
  );
}
