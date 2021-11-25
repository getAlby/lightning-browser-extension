import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CaretLeftIcon from "@bitcoin-design/bitcoin-icons/svg/filled/caret-left.svg";
import { QrcodeIcon } from "@heroicons/react/outline";
import CrossIcon from "@bitcoin-design/bitcoin-icons/svg/filled/cross.svg";

import utils from "../../common/lib/utils";
import getOriginData from "../../extension/content-script/originData";
import lnurlLib from "../../common/lib/lnurl";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Input from "../components/Form/Input";
import Header from "../components/Header";
import QrcodeScanner from "../components/QrcodeScanner";

function Send() {
  const [invoice, setInvoice] = useState("");
  const navigate = useNavigate();
  const [qrIsOpen, setQrIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      let lnurl = lnurlLib.findLnurl(invoice);
      if (!lnurl && lnurlLib.isLightningAddress(invoice)) {
        lnurl = invoice;
      }

      if (lnurl) {
        setLoading(true);
        const details = await lnurlLib.getDetails(lnurl);
        navigate("/lnurlPay", {
          state: {
            details,
            origin: getOriginData(),
          },
        });
      } else {
        await utils.call(
          "sendPaymentOrPrompt",
          { paymentRequest: invoice },
          { origin: getOriginData() }
        );
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
              icon={
                <img
                  className="w-4 h-4"
                  src={CrossIcon}
                  alt=""
                  aria-hidden="true"
                />
              }
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
            icon={
              <img
                className="w-4 h-4"
                src={CaretLeftIcon}
                alt=""
                aria-hidden="true"
              />
            }
          />
        }
        headerRight={
          <IconButton
            onClick={() => setQrIsOpen(true)}
            icon={
              <QrcodeIcon
                className="h-6 w-6 text-blue-500"
                aria-hidden="true"
              />
            }
          />
        }
      />
      <form className="p-4 max-w-screen-sm mx-auto" onSubmit={handleSubmit}>
        <label
          htmlFor="invoice"
          className="mt-2 block font-medium text-gray-700"
        >
          Lightning Invoice
        </label>
        <div className="mt-1 mb-4">
          <Input
            name="invoice"
            placeholder="Paste invoice, lnurl or lightning address"
            value={invoice}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setInvoice(event.target.value)
            }
          />
        </div>
        <Button
          type="submit"
          label="Continue"
          primary
          fullWidth
          loading={loading}
          disabled={invoice === ""}
        />
      </form>
    </div>
  );
}

export default Send;
