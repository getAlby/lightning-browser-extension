import Button from "@components/Button";
import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import TextField from "@components/form/TextField";
import { PopiconsChevronLeftLine } from "@popicons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import QrcodeAdornment from "~/app/components/QrcodeAdornment";
import toast from "~/app/components/Toast";
import { extractLightningTagData } from "~/app/utils";
import lnurlLib from "~/common/lib/lnurl";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";

function LNURLRedeem() {
  const { t } = useTranslation("translation", { keyPrefix: "lnurlredeem" });
  const location = useLocation();
  // location.state used to access the decoded QR coming from ScanQRCode screen
  const [lnurlWithdrawLink, setLnurlWithdrawLink] = useState(
    location.state?.decodedQR || ""
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      const lnurl = lnurlLib.findLnurl(lnurlWithdrawLink);

      if (lnurl) {
        const lnurlDetails = await lnurlLib.getDetails(lnurl);

        if (isLNURLDetailsError(lnurlDetails)) {
          toast.error(lnurlDetails.reason);
          return;
        }

        if (lnurlDetails.tag === "withdrawRequest") {
          navigate("/lnurlWithdraw", {
            state: {
              args: {
                lnurlDetails,
              },
            },
          });
        } else {
          toast.error(t("errors.invalid_withdraw_request"));
          return;
        }
      } else {
        toast.error(t("errors.invalid_lnurl"));
        return;
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        headerLeft={
          <IconButton
            onClick={() => navigate(-1)}
            icon={<PopiconsChevronLeftLine className="w-5 h-5" />}
          />
        }
      >
        {t("title")}
      </Header>
      <form onSubmit={handleSubmit} className="h-full">
        <Container justifyBetween maxWidth="sm">
          <div className="pt-4">
            <TextField
              id="lnurlwithdraw"
              label={t("input.label")}
              value={lnurlWithdrawLink}
              placeholder={t("input.placeholder")}
              disabled={loading}
              autoFocus
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setLnurlWithdrawLink(
                  extractLightningTagData(event.target.value.trim())
                )
              }
              endAdornment={<QrcodeAdornment route="lnurlRedeem" />}
            />
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              label={t("actions.withdraw")}
              primary
              fullWidth
              loading={loading}
              disabled={lnurlWithdrawLink === "" || loading}
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default LNURLRedeem;
