export type SpinSection = {
  id: string;
  title: string;
  imageUri: string;
};

export const getDefaultSpinSections = (): SpinSection[] => [
  { id: "sec-1", title: "Greg 1", imageUri: "https://placehold.co/240x360?text=Greg+1" },
  { id: "sec-2", title: "Greg 2", imageUri: "https://placehold.co/240x360?text=Greg+2" },
  { id: "sec-3", title: "Greg 3", imageUri: "https://placehold.co/240x360?text=Greg+3" },
  { id: "sec-4", title: "Greg 4", imageUri: "https://placehold.co/240x360?text=Greg+4" },
  { id: "sec-5", title: "Greg 5", imageUri: "https://placehold.co/240x360?text=Greg+5" },
  { id: "sec-6", title: "Greg 6", imageUri: "https://placehold.co/240x360?text=Greg+6" },
  { id: "sec-7", title: "Greg 7", imageUri: "https://placehold.co/240x360?text=Greg+7" },
  { id: "sec-8", title: "Greg 8", imageUri: "https://placehold.co/240x360?text=Greg+8" },
];
