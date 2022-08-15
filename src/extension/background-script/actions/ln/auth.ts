import { MessageLnurlAuth } from "~/types";

import { auth as lnurlAuth } from "../lnurl/auth";

const auth = async (message: MessageLnurlAuth) => {
  const { lnurlDetails } = message.args;

  try {
    const response = await lnurlAuth(lnurlDetails);
    return response;
  } catch (e) {
    console.error(e);
  }
};

export default auth;
