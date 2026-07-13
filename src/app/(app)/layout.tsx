import { AthleteProvider } from "@/components/AthleteProvider";
import { NavBar } from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AthleteProvider>
      <NavBar />
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1">{children}</main>
    </AthleteProvider>
  );
}
