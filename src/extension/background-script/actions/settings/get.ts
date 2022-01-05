import state from "../../state";

const DEFAULT_SETTINGS = {
  websiteEnhancements: true,
  userName: ''
};

const get = async () => {
  const settings = state.getState().settings;
  return {
    data: {
      ...DEFAULT_SETTINGS,
      ...settings,
    },
  };
};

export default get;
