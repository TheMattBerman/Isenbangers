import { Banger } from "../types/banger";

export const mockBangers: Banger[] = [
  {
    id: "1",
    text: "The best time to plant a tree was 20 years ago. The second best time is now. The third best time is after you've validated your idea with 100 customers.",
    category: "startup",
    dateAdded: "2024-01-01",
    audioUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  },
  {
    id: "2", 
    text: "Your competition isn't other startups. Your competition is your customer doing nothing.",
    category: "mindset",
    dateAdded: "2024-01-02",
  },
  {
    id: "3",
    text: "Fundraising is like dating. If you're desperate, everyone can smell it. If you're confident and have options, everyone wants you.",
    category: "fundraising",
    dateAdded: "2024-01-03",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
  {
    id: "4",
    text: "The difference between a successful founder and a failed one? The successful one failed 3 more times.",
    category: "grit",
    dateAdded: "2024-01-04",
  },
  {
    id: "5",
    text: "Growth hack #1: Build something people actually want. Everything else is just marketing theater.",
    category: "growth",
    dateAdded: "2024-01-05",
  },
  {
    id: "6",
    text: "Your MVP should be embarrassing. If you're not embarrassed by your first version, you launched too late.",
    category: "startup",
    dateAdded: "2024-01-06",
  },
  {
    id: "7",
    text: "VCs don't invest in ideas. They invest in traction. Traction is the only truth in startups.",
    category: "fundraising",
    dateAdded: "2024-01-07",
  },
  {
    id: "8",
    text: "The market doesn't care about your feelings. It only cares about your solutions.",
    category: "mindset",
    dateAdded: "2024-01-08",
  },
  {
    id: "9",
    text: "Overnight success takes 10 years. But most people quit after 10 months.",
    category: "grit",
    dateAdded: "2024-01-09",
  },
  {
    id: "10",
    text: "Distribution > Product. The best product with no distribution loses to an okay product with great distribution every time.",
    category: "growth",
    dateAdded: "2024-01-10",
  },
  {
    id: "11",
    text: "Your biggest risk isn't running out of money. It's running out of time before you figure out product-market fit.",
    category: "startup",
    isRare: true,
    dateAdded: "2024-01-11",
  },
  {
    id: "12",
    text: "Customers don't buy products. They buy better versions of themselves.",
    category: "mindset",
    dateAdded: "2024-01-12",
  },
  {
    id: "13",
    text: "The best founders are translators. They translate customer pain into product solutions.",
    category: "startup",
    dateAdded: "2024-01-13",
  },
  {
    id: "14",
    text: "Raise money when you don't need it. Hire when you can't afford it. Scale when it hurts.",
    category: "fundraising",
    isRare: true,
    dateAdded: "2024-01-14",
  },
  {
    id: "15",
    text: "Your network is your net worth, but your execution is your everything.",
    category: "general",
    dateAdded: "2024-01-15",
  },
  {
    id: "16",
    text: "The graveyard of startups is filled with perfect business plans and zero customers.",
    category: "startup",
    dateAdded: "2024-01-16",
  },
  {
    id: "17",
    text: "Pivot doesn't mean quit. It means you're smart enough to change direction when the data tells you to.",
    category: "grit",
    dateAdded: "2024-01-17",
  },
  {
    id: "18",
    text: "Your biggest competitor isn't who you think it is. It's the status quo.",
    category: "mindset",
    dateAdded: "2024-01-18",
  },
  {
    id: "19",
    text: "Viral growth is not a strategy. It's a result of solving a real problem really well.",
    category: "growth",
    dateAdded: "2024-01-19",
  },
  {
    id: "20",
    text: "The best time to start a company was yesterday. The second best time is today. The worst time is tomorrow.",
    category: "general",
    isRare: true,
    dateAdded: "2024-01-20",
  }
];

export const getTodaysBanger = (): Banger => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const bangerIndex = dayOfYear % mockBangers.length;
  return mockBangers[bangerIndex];
};

export const getRandomBanger = (): Banger => {
  const randomIndex = Math.floor(Math.random() * mockBangers.length);
  return mockBangers[randomIndex];
};

export const getRareBanger = (): Banger => {
  const rareBangers = mockBangers.filter(banger => banger.isRare);
  if (rareBangers.length === 0) return getRandomBanger();
  const randomIndex = Math.floor(Math.random() * rareBangers.length);
  return rareBangers[randomIndex];
};