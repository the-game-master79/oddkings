// Manual mappings for match flags
const matchFlagMappings: Record<string, { team1: string; team2: string }> = {
  // Soccer/Football matches
  "Manchester United vs Liverpool": { team1: "GB", team2: "GB" },
  "Barcelona vs Real Madrid": { team1: "ES", team2: "ES" },
  "PSG vs Bayern Munich": { team1: "FR", team2: "DE" },
  
  // Cricket matches
  "India vs Australia": { team1: "IN", team2: "AU" },
  "England vs New Zealand": { team1: "GB", team2: "NZ" },
  
  // Basketball matches
  "Lakers vs Celtics": { team1: "US", team2: "US" },
  
  // Add more match mappings as needed
};

export function getMatchFlags(matchTitle: string): { team1: string; team2: string } {
  // Check exact match first
  if (matchFlagMappings[matchTitle]) {
    return matchFlagMappings[matchTitle];
  }

  // Try case-insensitive match
  const lowerMatchTitle = matchTitle.toLowerCase();
  for (const [key, value] of Object.entries(matchFlagMappings)) {
    if (key.toLowerCase() === lowerMatchTitle) {
      return value;
    }
  }

  return { team1: '', team2: '' };
}
