import { Calendar } from "@/components/calendar/Calendar";
import { protectedServerRoute } from "@/utils/protectedServerRoute";

export default async function Home() {
  const session = await protectedServerRoute();
  return (
    <main className="min-h-screen">
      <Calendar session={session} />
    </main>
  );
}
