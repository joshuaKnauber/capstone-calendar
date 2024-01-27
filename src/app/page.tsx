import { CalendarDrawer } from "@/components/ui/Drawer";
import { Calendar } from "@/components/calendar/Calendar";
import { protectedServerRoute } from "@/lib/utils/protectedServerRoute";
import { Settings } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await protectedServerRoute();
  return (
    <main className="relative min-h-[100svh]">
      <Link
        href={"/preferences"}
        className="fixed right-2 top-2 z-50 rounded-full bg-white p-2 ring-1 ring-inset ring-black/100"
      >
        <Settings className="pointer-events-none h-5 w-5" />
      </Link>
      <CalendarDrawer access_token={session.provider_token!} />
      <Calendar session={session} />
    </main>
  );
}
