import {
  CaretLeftIcon,
  CrossIcon,
  QrCodeIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import QrcodeScanner from "@components/QrcodeScanner";
import TextField from "@components/form/TextField";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import lnurlLib from "~/common/lib/lnurl";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";

function LNURLRedeem() {
  const { t } = useTranslation("translation", { keyPrefix: "lnurlredeem" });

  const [invoice, setInvoice] = useState("");
  const navigate = useNavigate();
  const [qrIsOpen, setQrIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);

      const lnurl = lnurlLib.findLnurl(invoice);

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
          toast.error("Not a lnurl-withdraw request");
          return;
        }
      } else {
        toast.error("Not a valid LNURL");
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

  function extractInvoiceFrom(data: string) {
    const reqExp = /lightning=([^&|\b]+)/i;

    const invoice = data.match(reqExp);

    if (invoice) {
      return invoice[1];
    } else {
      return data.replace(/^lightning:/i, "");
    }
  }

  if (qrIsOpen) {
    return (
      <div>
        <Header
          title={t("qrcode.title")}
          headerRight={
            <IconButton
              onClick={() => setQrIsOpen(false)}
              icon={<CrossIcon className="w-4 h-4" />}
            />
          }
        />
        <Container maxWidth="sm">
          <QrcodeScanner
            qrbox={200}
            qrCodeSuccessCallback={(decodedText) => {
              if (invoice !== decodedText) {
                setInvoice(extractInvoiceFrom(decodedText));
                setQrIsOpen(false);
              }
            }}
            qrCodeErrorCallback={console.error}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        title={t("title")}
        headerLeft={
          <IconButton
            onClick={() => navigate(-1)}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      <form onSubmit={handleSubmit} className="h-full">
        <Container justifyBetween maxWidth="sm">
          <div className="pt-4">
            <TextField
              id="invoice"
              label={t("input.label")}
              value={invoice}
              placeholder={t("input.placeholder")}
              disabled={loading}
              autoFocus
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setInvoice(extractInvoiceFrom(event.target.value.trim()))
              }
              endAdornment={
                <button
                  aria-label="Scan QR"
                  type="button"
                  className="flex justify-center items-center w-10 h-8"
                  onClick={() => setQrIsOpen(true)}
                >
                  <QrCodeIcon className="h-6 w-6 text-blue-600" />
                </button>
              }
            />
          </div>
          <div className="my-4">
            <Button
              type="submit"
              label={t("actions.withdraw")}
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

export default LNURLRedeem;
