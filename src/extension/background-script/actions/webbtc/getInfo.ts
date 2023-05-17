import { MessageGetInfo } from "~/types";

const getInfo = async (message: MessageGetInfo) => {
  const supportedMethods = ["getInfo", "signPsbt", "getAddress", "getAddress"];

  return {
    data: {
      version: "Alby",
      supports: ["bitcoin"],
      methods: supportedMethods,
    },
  };
};

export default getInfo;
