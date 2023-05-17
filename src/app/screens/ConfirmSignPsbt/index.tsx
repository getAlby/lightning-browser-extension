//import Checkbox from "../../components/Form/Checkbox";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "~/app/components/Loading";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import { PsbtPreview, getPsbtPreview } from "~/common/lib/psbt";
import type { OriginData } from "~/types";

function ConfirmSignPsbt() {
  const navState = useNavigationState();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_sign_message",
  });
  const navigate = useNavigate();

  const psbt = navState.args?.psbt as string;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState<PsbtPreview | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const settings = await api.getSettings();
      setPreview(getPsbtPreview(psbt, settings.bitcoinNetwork));
    })();
  }, [origin, psbt]);

  async function confirm() {
    try {
      setLoading(true);
      const response = await msg.request("signPsbt", { psbt }, { origin });
      msg.reply(response);
      setSuccessMessage(tCommon("success"));
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  function close(e: React.MouseEvent<HTMLButtonElement>) {
    if (navState.isPrompt) {
      window.close();
    } else {
      e.preventDefault();
      navigate(-1);
    }
  }

  if (!preview) {
    return <Loading />;
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={/*t("title")*/ "Sign PSBT"} />
      {!successMessage ? (
        <Container justifyBetween maxWidth="sm">
          <div>
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={origin.host}
            />
            <ContentMessage
              heading={"inputs"}
              content={preview.inputs
                .map(
                  (input) =>
                    input.address.substring(0, 5) +
                    "..." +
                    input.address.substring(
                      input.address.length - 5,
                      input.address.length
                    ) +
                    ": " +
                    input.amount +
                    " sats"
                )
                .join("\n")}
            />
            <ContentMessage
              heading={"outputs"}
              content={preview.outputs
                .map(
                  (output) =>
                    output.address.substring(0, 5) +
                    "..." +
                    output.address.substring(
                      output.address.length - 5,
                      output.address.length
                    ) +
                    ": " +
                    output.amount +
                    " sats"
                )
                .join("\n")}
            />
            <ContentMessage
              heading={t("content", { host: origin.host })}
              content={psbt}
            />
          </div>
          <ConfirmOrCancel
            disabled={loading}
            loading={loading}
            onConfirm={confirm}
            onCancel={reject}
          />
        </Container>
      ) : (
        <Container maxWidth="sm">
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
          />
          <SuccessMessage message={successMessage} onClose={close} />
        </Container>
      )}
    </div>
  );
}

export default ConfirmSignPsbt;
