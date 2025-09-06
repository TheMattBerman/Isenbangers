import { view } from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: async (key: string) => {
      // You can implement custom storage here if needed
      return null;
    },
    setItem: async (key: string, value: string) => {
      // You can implement custom storage here if needed
      return;
    },
  },
});

export default StorybookUIRoot;