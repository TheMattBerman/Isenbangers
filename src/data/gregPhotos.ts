export type GregPhoto = { id: string; title: string; uri: string };

// Source of truth for Wheel of Greg photos.
// Add new entries to this array in the order you want them to appear.
// We will map the first 8 items to the wheel; extras are ignored for now.
export const gregPhotos: GregPhoto[] = [
  {
    id: "greg-1",
    title: "Greg Shades",
    uri: "https://images.composerapi.com/E5B590D4-C68C-4827-9BB7-A73BE9899190.jpg",
  },
  { id: "greg-2", title: "Greg 2", uri: "https://images.composerapi.com/1D02BB37-4F12-48D5-924A-9BF966BC83D0.jpg" },
  { id: "greg-3", title: "Greg 3", uri: "https://images.composerapi.com/FEF681AF-BCB5-4A50-A7B4-94E5A92D1B28.jpg" },
  { id: "greg-4", title: "Greg 4", uri: "https://placehold.co/512x512?text=Greg+4" },
  { id: "greg-5", title: "Greg 5", uri: "https://placehold.co/512x512?text=Greg+5" },
  { id: "greg-6", title: "Greg 6", uri: "https://placehold.co/512x512?text=Greg+6" },
  { id: "greg-7", title: "Greg 7", uri: "https://placehold.co/512x512?text=Greg+7" },
  { id: "greg-8", title: "Greg 8", uri: "https://placehold.co/512x512?text=Greg+8" },
];
