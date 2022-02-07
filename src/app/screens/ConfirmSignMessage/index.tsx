import { useState, useRef } from "react";

import Button from "../../components/Button";
//import Checkbox from "../../components/Form/Checkbox";
import PublisherCard from "../../components/PublisherCard";
import msg from "../../../common/lib/msg";
import utils from "../../../common/lib/utils";
import getOriginData from "../../../extension/content-script/originData";
import type { OriginData } from "../../../types";

type Props = {
  origin: OriginData;
  message: string;
};

function ConfirmSignMessage(props: Props) {
  const messageRef = useRef(props.message);
  const originRef = useRef(props.origin || getOriginData());
  //const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [succesMessage, setSuccessMessage] = useState("");

  async function confirm() {
    //if (rememberMe) {
    //  await autoSign();
    //}

    try {
      setLoading(true);
      const response = await utils.call(
        "signMessage",
        { message: messageRef.current },
        { origin: originRef.current }
      );
      msg.reply(response);
      setSuccessMessage("Success!");
    } catch (e) {
      console.error(e);
      if (e instanceof Error) alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  //function autoSign() {
  // TODO
  //}

  function renderSuccesMessage() {
    return (
      <>
        <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
          <dt className="text-sm font-semibold text-gray-500">Message</dt>
          <dd className="text-sm mb-4 dark:text-white">{succesMessage}</dd>
        </dl>
        <div className="text-center">
          <button
            className="underline text-sm text-gray-500"
            onClick={() => window.close()}
          >
            Close
          </button>
        </div>
      </>
    );
  }

  function reject(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    msg.error("User rejected");
  }

  return (
    <div>
      <PublisherCard
        title={originRef.current.name}
        image={originRef.current.icon}
      />

      <div className="p-4 max-w-screen-sm mx-auto">
        {!succesMessage ? (
          <>
            <dl className="shadow bg-white dark:bg-gray-700 p-4 rounded-lg mb-8">
              <dt className="font-semibold text-gray-500">
                {originRef.current.host} asks you to sign:
              </dt>
              <dd className="mb-6 dark:text-white">{messageRef.current}</dd>
            </dl>

            <div className="mb-8">
              {/*
              <div className="flex items-center">
                <Checkbox
                  id="remember_me"
                  name="remember_me"
                  checked={rememberMe}
                  onChange={(event) => {
                    setRememberMe(event.target.checked);
                  }}
                />
                <label
                  htmlFor="remember_me"
                  className="ml-2 block text-sm text-gray-900 font-medium dark:text-white"
                >
                  Remember and auto sign in the future
                </label>
              </div>
              */}
            </div>

            <div className="text-center">
              <div className="mb-5">
                <Button
                  onClick={confirm}
                  label="Confirm"
                  fullWidth
                  primary
                  disabled={loading}
                  loading={loading}
                />
              </div>

              <p className="mb-3 underline text-sm text-gray-300">
                Only connect with sites you trust.
              </p>

              <a
                className="underline text-sm text-gray-500 dark:text-gray-400"
                href="#"
                onClick={reject}
              >
                Cancel
              </a>
            </div>
          </>
        ) : (
          renderSuccesMessage()
        )}
      </div>
    </div>
  );
}

export default ConfirmSignMessage;
