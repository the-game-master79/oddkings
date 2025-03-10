import { SportsHeader } from "@/features/sports/components/SportsHeader";
import { SportsCard } from "@/features/sports/components/SportsCard";

export default function SportsPage() {
  return (
    <div className="w-full px-2 py-2 md:container md:mx-auto">
      <SportsHeader />
      <div className="grid gap-4">
        <SportsCard
          team1="Manchester United"
          team2="Liverpool"
          date="2024-02-20 19:00"
          mockData="Mock Data #123"
        />
        {/* Add more SportsCard components as needed */}
      </div>
    </div>
  );
}
