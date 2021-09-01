import state from "../../state";

const all = async (message, sender) => {
  const accounts = await state.getState().accounts;

  return {
    data: accounts,
  };
};

export default all;
