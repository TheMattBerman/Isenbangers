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
  { id: "greg-2", title: "Greg 2", uri: "https://images.composerapi.com/5AEC3A32-8322-4C41-B9F3-8C347D7192CF.jpg" },
  { id: "greg-3", title: "Greg 3", uri: "https://images.composerapi.com/FEF681AF-BCB5-4A50-A7B4-94E5A92D1B28.jpg" },
  { id: "greg-4", title: "Greg 4", uri: "https://images.composerapi.com/BC616E90-DAAF-4F36-8985-00A5C350B9B1.jpg" },
  { id: "greg-5", title: "Greg 5", uri: "https://images.composerapi.com/F5926E6D-7510-4E00-8082-3E7F3EA1BD48.jpg" },
  { id: "greg-6", title: "Greg 6", uri: "https://images.composerapi.com/89D59CA1-F7B3-4908-8E41-B294F1025268.jpg" },
  { id: "greg-7", title: "Greg 7", uri: "https://placehold.co/512x512?text=Greg+7" },
  { id: "greg-8", title: "Greg 8", uri: "https://placehold.co/512x512?text=Greg+8" },
];
