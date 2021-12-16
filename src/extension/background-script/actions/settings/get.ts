import state from "../../state";

const DEFAULT_SETTINGS = {
  websiteEnhancements: true,
};

const get = async () => {
  const settings = state.getState().settings;
  return {
    data: {
      settings: {
        ...DEFAULT_SETTINGS,
        ...settings,
      },
    },
  };
};

export default get;
