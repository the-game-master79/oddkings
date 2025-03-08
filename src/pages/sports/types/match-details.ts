
export interface SportQuestion {
  id: string;
  question: string;
  category: string; // Keep this as string to be compatible
  yes_value: number;
  no_value: number;
  status: 'active' | 'resolved_yes' | 'resolved_no';
  end_datetime: string;
  match_id: string;
  created_at: string;
  created_by: string;
  resolved_by?: string;
  resolved_at?: string;
}

export interface MatchDetails {
  id: string;
  title: string;
  event_id: string;
  event_title: string;
  sport: string;
  trade_start_time: string;
  trade_end_time: string;
  live_start_time: string;
  country: string;
}

// Define the SportEvent interface to match the potential return from the database
export interface SportEvent {
  title?: string;
  sport?: string;
  country?: string;
}

// Define what the match data from Supabase might include
export interface MatchDataResponse {
  id: string;
  title: string;
  event_id: string;
  trade_start_time: string;
  trade_end_time: string;
  live_start_time: string;
  sport_events?: SportEvent;
}
