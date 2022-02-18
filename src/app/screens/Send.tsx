import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CaretLeftIcon,
  CrossIcon,
  QrCodeIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { parsePaymentRequest } from "invoices";

import lnurlLib from "../../common/lib/lnurl";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Header from "../components/Header";
import QrcodeScanner from "../components/QrcodeScanner";
import TextField from "../components/Form/TextField";

function Send() {
  const [invoice, setInvoice] = useState("");
  const navigate = useNavigate();
  const [qrIsOpen, setQrIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      let lnurl = lnurlLib.findLnurl(invoice);
      if (!lnurl && lnurlLib.isLightningAddress(invoice)) {
        lnurl = invoice;
      }

      if (lnurl) {
        await lnurlLib.getDetails(lnurl); // throws if invalid.
        navigate(`/lnurlPay?lnurl=${lnurl}`);
      } else {
        parsePaymentRequest({ request: invoice }); // throws if invalid.
        navigate(`/confirmPayment?paymentRequest=${invoice}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    } finally {
      setLoading(false);
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
        <div className="p-4 max-w-screen-sm mx-auto">
          <QrcodeScanner
            qrbox={200}
            qrCodeSuccessCallback={(decodedText) => {
              if (invoice !== decodedText) {
                setInvoice(decodedText);
                setQrIsOpen(false);
              }
            }}
            qrCodeErrorCallback={console.error}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Send a payment"
        headerLeft={
          <IconButton
            onClick={() => navigate("/")}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
        headerRight={
          <IconButton
            onClick={() => setQrIsOpen(true)}
            icon={<QrCodeIcon className="h-6 w-6 text-blue-500" />}
          />
        }
      />
      <form className="p-4 max-w-screen-sm mx-auto" onSubmit={handleSubmit}>
        <TextField
          id="invoice"
          label="Lightning Invoice"
          placeholder="Paste invoice, lnurl or lightning address"
          value={invoice}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setInvoice(event.target.value)
          }
        />
        <div className="mt-4">
          <Button
            type="submit"
            label="Continue"
            primary
            fullWidth
            loading={loading}
            disabled={invoice === ""}
          />
        </div>
      </form>
    </div>
  );
}

export default Send;
