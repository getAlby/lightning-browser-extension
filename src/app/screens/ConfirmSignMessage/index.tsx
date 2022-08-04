//import Checkbox from "../../components/Form/Checkbox";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import getOriginData from "~/extension/content-script/originData";
import type { OriginData } from "~/types";

type Props = {
  origin: OriginData;
  message: string;
};

function ConfirmSignMessage(props: Props) {
  const messageRef = useRef(props.message);
  const originRef = useRef(props.origin || getOriginData());
  //const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  //function autoSign() {
  // TODO
  //}

  function reject(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={"Sign"} />
      {!successMessage ? (
        <div className="h-full flex flex-col justify-between">
          <div>
            <PublisherCard
              title={originRef.current.name}
              image={originRef.current.icon}
              url={originRef.current.host}
            />
            <ContentMessage
              heading={`${originRef.current.host} asks you to sign:`}
              content={messageRef.current}
            />
            {/*
              <div className="mb-8">
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
              </div>
            */}
          </div>
          <ConfirmOrCancel
            disabled={loading}
            loading={loading}
            onConfirm={confirm}
            onCancel={reject}
          />
        </div>
      ) : (
        <>
          <PublisherCard
            title={originRef.current.name}
            image={originRef.current.icon}
            url={originRef.current.host}
          />
          <SuccessMessage
            message={successMessage}
            onClose={() => window.close()}
          />
        </>
      )}
    </div>
  );
}

export default ConfirmSignMessage;
