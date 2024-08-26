import Button from "@components/Button";
import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import TextField from "@components/form/TextField";
import { PopiconsChevronLeftLine } from "@popicons/react";
import lightningPayReq from "bolt11-signet";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import QrcodeAdornment from "~/app/components/QrcodeAdornment";
import toast from "~/app/components/Toast";
import { extractLightningTagData, isBitcoinAddress } from "~/app/utils";
import lnurlLib from "~/common/lib/lnurl";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";

function Send() {
  const { t } = useTranslation("translation", { keyPrefix: "send" });
  const { t: tCommon } = useTranslation("common");
  const location = useLocation();
  // location.state used to access the decoded QR coming from ScanQRCode screen
  const [invoice, setInvoice] = useState(location.state?.decodedQR || "");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function isPubKey(str: string) {
    return str.length == 66 && (str.startsWith("02") || str.startsWith("03"));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);

      let lnurl = lnurlLib.findLnurl(invoice);

      if (lnurlLib.isLightningAddress(invoice)) {
        lnurl = invoice;
      }

      if (lnurl?.endsWith("phoenixwallet.me")) {
        throw new Error(
          "Paying Phoenix addresses is not possible. Phoenix is not compatible with the current state of lightning addresses as they use a different protocol."
        );
      }

      if (lnurl) {
        const lnurlDetails = await lnurlLib.getDetails(lnurl);
        if (isLNURLDetailsError(lnurlDetails)) {
          toast.error(lnurlDetails.reason);
          return;
        }

        if (lnurlDetails.tag === "channelRequest") {
          navigate("/lnurlChannel", {
            state: {
              args: {
                lnurlDetails,
              },
            },
          });
        }

        if (lnurlDetails.tag === "login") {
          navigate("/lnurlAuth", {
            state: {
              args: {
                lnurlDetails,
              },
            },
          });
        }

        if (lnurlDetails.tag === "payRequest") {
          navigate("/lnurlPay", {
            state: {
              args: {
                lnurlDetails,
              },
            },
          });
        }

        if (lnurlDetails.tag === "withdrawRequest") {
          navigate("/lnurlWithdraw", {
            state: {
              args: {
                lnurlDetails,
              },
            },
          });
        }
      } else if (isPubKey(invoice)) {
        navigate("/keysend", {
          state: {
            args: {
              destination: invoice,
            },
          },
        });
      } else if (isBitcoinAddress(invoice)) {
        navigate("/sendToBitcoinAddress", {
          state: { args: { bitcoinAddress: invoice } },
        });
      } else {
        lightningPayReq.decode(invoice); // throws if invalid.
        navigate("/confirmPayment", {
          state: {
            args: {
              paymentRequest: invoice,
            },
          },
        });
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
              id="invoice"
              label={t("input.label")}
              hint={t("input.hint_with_bitcoin_address")}
              value={invoice}
              disabled={loading}
              autoFocus
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setInvoice(extractLightningTagData(event.target.value.trim()))
              }
              endAdornment={<QrcodeAdornment route="send" />}
            />
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              label={tCommon("actions.continue")}
              primary
              fullWidth
              loading={loading}
              disabled={invoice === "" || loading}
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default Send;
