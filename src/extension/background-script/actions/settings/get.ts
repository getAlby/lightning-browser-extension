import state from "../../state";

const get = async () => {
  const settings = state.getState().settings;
  return {
    data: settings,
  };
};

export default get;
