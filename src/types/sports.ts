
export type SportCategory = 
  | "Cricket" 
  | "Soccer" 
  | "Tennis" 
  | "Basketball" 
  | "Horse Racing" 
  | "Baseball" 
  | "Ice Hockey" 
  | "Volleyball"
  | "LOL"
  | "Martial Arts"
  | "Boxing"
  | "Chess"
  | "F1"
  | "ESports"
  | "Badminton";
  
export const SPORT_CATEGORIES: { label: string; value: SportCategory }[] = [
  { label: "Cricket", value: "Cricket" },
  { label: "Soccer", value: "Soccer" },
  { label: "Tennis", value: "Tennis" },
  { label: "Basketball", value: "Basketball" },
  { label: "Horse Racing", value: "Horse Racing" },
  { label: "Baseball", value: "Baseball" },
  { label: "Ice Hockey", value: "Ice Hockey" },
  { label: "League of Legends", value: "LOL" },
  { label: "Martial Arts", value: "Martial Arts" },
  { label: "Boxing", value: "Boxing" },
  { label: "Chess", value: "Chess" },
  { label: "F1", value: "F1" },
  { label: "ESports", value: "ESports" },
  { label: "Badminton", value: "Badminton" },
];

export interface SportEvent {
  id: string;
  sport: SportCategory;
  title: string;
  country: string;
  created_at: string;
  created_by?: string;
}

export interface SportMatch {
  id: string;
  event_id: string;
  title: string;
  trade_start_time: string;
  trade_end_time: string;
  live_start_time: string;
  created_at: string;
  created_by?: string;
  sport_events?: SportEvent; // Added sport_events property
}

export interface SportQuestion {
  id: string;
  match_id: string;
  question: string;
  category: SportCategory;
  yes_value: number;
  no_value: number;
  status: 'active' | 'resolved_yes' | 'resolved_no';
  end_datetime: string;
  created_at: string;
  created_by?: string;
  resolved_by?: string;
  resolved_at?: string;
}
