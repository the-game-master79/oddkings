import countries from "@/lib/countries.json";

// Add mapping for sports leagues to countries
const leagueCountryMappings: Record<string, string> = {
  "Premier League": "GB",
  "La Liga": "ES",
  "Bundesliga": "DE",
  "Serie A": "IT",
  "Ligue 1": "FR",
  "IPL": "IN",
  "NBA": "US",
  // Add more leagues as needed
};

// Common sports team country mappings
const teamCountryMappings: Record<string, string> = {
  // Soccer/Football teams
  "Manchester United": "GB",
  "Liverpool": "GB",
  "Chelsea": "GB",
  "Arsenal": "GB",
  "Barcelona": "ES",
  "Real Madrid": "ES",
  "Bayern Munich": "DE",
  "Juventus": "IT",
  "PSG": "FR",
  "AC Milan": "IT",
  "Inter Milan": "IT",
  "Manchester City": "GB",
  "Tottenham": "GB",
  "Newcastle": "GB",
  "Ajax": "NL",
  "Porto": "PT",
  "Benfica": "PT",
  "Napoli": "IT",
  "Dortmund": "DE",
  "PSV": "NL",
  
  // Cricket teams
  "Mumbai Indians": "IN",
  "Chennai Super Kings": "IN",
  "Royal Challengers": "IN",
  
  // Basketball teams
  "LA Lakers": "US",
  "Chicago Bulls": "US",
  "Boston Celtics": "US",
  
  // Add more team mappings as needed
};

export function getTeamCountryCode(teamName: string): string {
  // Clean the team name
  const cleanName = teamName.trim();

  // 1. Check direct team mapping first
  for (const [team, code] of Object.entries(teamCountryMappings)) {
    if (cleanName.toLowerCase().includes(team.toLowerCase())) {
      return code;
    }
  }

  // 2. Remove common suffixes/prefixes
  const searchName = cleanName
    .replace(/\s*(FC|United|City|Team|National|Club|Warriors|Kings|Riders)\s*$/i, '')
    .trim();
  
  // 3. Try exact country name match
  const exactMatch = countries.find(
    c => c.name.toLowerCase() === searchName.toLowerCase()
  );
  if (exactMatch) return exactMatch.code;
  
  // 4. Try partial country name match
  const partialMatch = countries.find(
    c => searchName.toLowerCase().includes(c.name.toLowerCase())
  );
  if (partialMatch) return partialMatch.code;

  // 5. Return empty string if no match found
  return '';
}

export function getCountryName(code: string): string {
  const country = countries.find(c => c.code === code);
  return country?.name || '';
}
