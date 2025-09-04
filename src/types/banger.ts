export interface Banger {
  id: string;
  text: string;
  category: "fundraising" | "grit" | "growth" | "mindset" | "startup" | "general";
  isRare?: boolean;
  dateAdded: string;
  audioUrl?: string;
}

export interface DailyBanger {
  date: string;
  banger: Banger;
  hasBeenViewed: boolean;
}