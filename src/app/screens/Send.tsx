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
import lightningPayReq from "bolt11";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import lnurlLib from "~/common/lib/lnurl";
import getOriginData from "~/extension/content-script/originData";

function Send() {
  const [invoice, setInvoice] = useState("");
  const navigate = useNavigate();
  const [qrIsOpen, setQrIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function isPubKey(str: string) {
    return str.length == 66 && (str.startsWith("02") || str.startsWith("03"));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      let lnurl = lnurlLib.findLnurl(invoice);
      if (!lnurl && lnurlLib.isLightningAddress(invoice)) {
        lnurl = invoice;
      }

      if (lnurl) {
        const lnurlDetails = await lnurlLib.getDetails(lnurl);

        if (lnurlDetails.tag === "channelRequest") {
          navigate("/lnurlChannel", {
            state: {
              origin: getOriginData(),
              args: {
                lnurlDetails,
              },
            },
          });
        }

        if (lnurlDetails.tag === "payRequest") {
          navigate("/lnurlPay", {
            state: {
              origin: getOriginData(),
              args: {
                lnurlDetails,
              },
            },
          });
        }

        if (lnurlDetails.tag === "withdrawRequest") {
          navigate("/lnurlWithdraw", {
            state: {
              origin: getOriginData(),
              args: {
                lnurlDetails,
              },
            },
          });
        }
      } else if (isPubKey(invoice)) {
        navigate(`/keysend?destination=${invoice}`);
      } else {
        lightningPayReq.decode(invoice); // throws if invalid.
        navigate(`/confirmPayment?paymentRequest=${invoice}`);
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
      return data;
    }
  }

  if (qrIsOpen) {
    return (
      <div>
        <Header
          title="Waiting to scan invoice"
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
    <div>
      <Header
        title="Send"
        headerLeft={
          <IconButton
            onClick={() => navigate("/")}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      <div className="py-4">
        <Container maxWidth="sm">
          <form onSubmit={handleSubmit}>
            <TextField
              id="invoice"
              label="Lightning Invoice"
              placeholder="Paste invoice, lnurl or lightning address"
              value={invoice}
              disabled={loading}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setInvoice(event.target.value.trim())
              }
              endAdornment={
                <button
                  type="button"
                  className="flex justify-center items-center w-10 h-8"
                  onClick={() => setQrIsOpen(true)}
                >
                  <QrCodeIcon className="h-6 w-6 text-blue-500" />
                </button>
              }
            />
            <div className="mt-4">
              <Button
                type="submit"
                label="Continue"
                primary
                fullWidth
                loading={loading}
                disabled={invoice === "" || loading}
              />
            </div>
          </form>
        </Container>
      </div>
    </div>
  );
}

export default Send;
