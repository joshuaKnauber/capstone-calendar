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
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.blood_glucose.read",
      "https://www.googleapis.com/auth/fitness.blood_pressure.read",
      "https://www.googleapis.com/auth/fitness.body.read",
      "https://www.googleapis.com/auth/fitness.body_temperature.read",
      "https://www.googleapis.com/auth/fitness.heart_rate.read",
      "https://www.googleapis.com/auth/fitness.location.read",
      "https://www.googleapis.com/auth/fitness.nutrition.read",
      "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
      "https://www.googleapis.com/auth/fitness.reproductive_health.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
    ];
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
