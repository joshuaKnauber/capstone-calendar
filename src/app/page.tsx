import { CalendarDrawer } from "@/components/Drawer";
import { Calendar } from "@/components/calendar/Calendar";
import { protectedServerRoute } from "@/utils/protectedServerRoute";

export default async function Home() {
  const session = await protectedServerRoute();
  return (
    <main className="relative min-h-[100svh]">
      <CalendarDrawer />
      <Calendar session={session} />
    </main>
  );
}
