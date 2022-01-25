import { Fragment, useState, useEffect, MouseEvent } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  LNURLPaymentInfo,
  LNURLPaymentSuccessAction,
  LNURLPayServiceResponse,
} from "../../types";
import api from "../../common/lib/api";
import msg from "../../common/lib/msg";
import utils from "../../common/lib/utils";
import lnurl from "../../common/lib/lnurl";
import getOriginData from "../../extension/content-script/originData";
import { useAuth } from "../context/AuthContext";

import Button from "../components/Button";
import Input from "../components/Form/Input";
import PublisherCard from "../components/PublisherCard";

type Origin = {
  name: string;
  icon: string;
};

type Props = {
  details?: LNURLPayServiceResponse;
  origin?: Origin;
};

function LNURLPay(props: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(props.details);
  const [origin] = useState(
    props.origin ||
      (searchParams.get("origin") &&
        JSON.parse(searchParams.get("origin") as string)) ||
      getOriginData()
  );
  const [valueMSat, setValueMSat] = useState<number | undefined>(
    details?.minSendable
  );
  const [comment, setComment] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successAction, setSuccessAction] = useState<
    LNURLPaymentSuccessAction | undefined
  >();

  useEffect(() => {
    if (searchParams) {
      // lnurl was passed as querystring
      const lnurlString = searchParams.get("lnurl");
      if (lnurlString) {
        lnurl.getDetails(lnurlString).then((lnurlDetails) => {
          if (lnurlDetails.tag === "payRequest") {
            setDetails(lnurlDetails);
            setValueMSat(lnurlDetails.minSendable);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    api.getSettings().then((response) => {
      if (response.userName) {
        setUserName(response.userName);
      }
    });
  }, []);

  async function confirm() {
    if (!details) return;

    const payerdata =
      details.payerData && details.payerData.name && userName && userName.length
        ? { name: userName }
        : undefined;

    try {
      setLoadingConfirm(true);
      // Get the invoice
      const params = {
        amount: valueMSat, // user specified sum in MilliSatoshi
        comment, // https://github.com/fiatjaf/lnurl-rfc/blob/luds/12.md
        payerdata, // https://github.com/fiatjaf/lnurl-rfc/blob/luds/18.md
      };
      const { data: paymentInfo } = await axios.get<LNURLPaymentInfo>(
        details.callback,
        {
          params,
        }
      );
      const { pr: paymentRequest } = paymentInfo;

      const isValidInvoice = lnurl.verifyInvoice({
        paymentInfo,
        metadata: details.metadata,
        amount: valueMSat || 0,
        payerdata,
      });
      if (!isValidInvoice) {
        alert("Payment aborted. Invalid invoice");
        return;
      }

      // LN WALLET pays the invoice, no additional user confirmation is required at this point
      const payment = await utils.call(
        "lnurlPay",
        { paymentRequest },
        { origin }
      );

      // Once payment is fulfilled LN WALLET executes a non-null successAction
      // LN WALLET should also store successAction data on the transaction record
      if (paymentInfo.successAction && !payment.payment_error) {
        switch (paymentInfo.successAction.tag) {
          case "url":
          case "message":
            setSuccessAction(paymentInfo.successAction);
            break;
          case "aes": // TODO: For aes, LN WALLET must attempt to decrypt a ciphertext with payment preimage
          default:
            alert(
              `Not implemented yet. Please submit an issue to support success action: ${paymentInfo.successAction.tag}`
            );
            break;
        }
      } else {
        setSuccessAction({ tag: "message", message: "Success, payment sent!" });
      }

      auth.fetchAccountInfo(); // Update balance.
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        alert(`Error: ${e.message}`);
      }
    } finally {
      setLoadingConfirm(false);
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    if (props.details && props.origin) {
      msg.error("User rejected");
    } else {
      navigate(-1);
    }
  }

  function renderAmount(minSendable: number, maxSendable: number) {
    if (minSendable === maxSendable) {
      return <p>{`${minSendable / 1000} sat`}</p>;
    } else {
      return (
        <div className="mt-1 flex flex-col">
          <Input
            type="number"
            min={minSendable / 1000}
            max={maxSendable / 1000}
            value={valueMSat ? valueMSat / 1000 : undefined}
            onChange={(e) => {
              let newValue;
              if (e.target.value) {
                newValue = parseInt(e.target.value) * 1000;
              }
              setValueMSat(newValue);
            }}
          />
          <div className="flex space-x-1.5 mt-2">
            <Button
              fullWidth
              label="100 sat⚡"
              onClick={() => {
                setValueMSat(100000);
              }}
            />
            <Button
              fullWidth
              label="1K sat⚡"
              onClick={() => {
                setValueMSat(1000000);
              }}
            />
            <Button
              fullWidth
              label="5K sat⚡"
              onClick={() => {
                setValueMSat(5000000);
              }}
            />
            <Button
              fullWidth
              label="10K sat⚡"
              onClick={() => {
                setValueMSat(10000000);
              }}
            />
          </div>
        </div>
      );
    }
  }

  function renderComment() {
    return (
      <div className="flex flex-col">
        <Input
          type="text"
          placeholder="optional"
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
      </div>
    );
  }

  function renderName() {
    return (
      <div className="mt-1 flex flex-col">
        <Input
          type="text"
          placeholder="optional"
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        />
      </div>
    );
  }

  function formattedMetadata(metadataJSON: string) {
    try {
      const metadata = JSON.parse(metadataJSON);
      return metadata
        .map(([type, content]: [string, string]) => {
          if (type === "text/plain") {
            return ["Description", content];
          } else if (type === "text/long-desc") {
            return ["Full Description", <p key={type}>{content}</p>];
          } else if (["image/png;base64", "image/jpeg;base64"].includes(type)) {
            return [
              "lnurl",
              <img key={type} src={`data:${type},${content}`} alt="lnurl" />,
            ];
          }
          return undefined;
        })
        .filter(Boolean);
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  function elements() {
    if (!details) return [];
    const elements = [];
    elements.push(["Send payment to", details.domain]);
    elements.push(...formattedMetadata(details.metadata));
    elements.push([
      "Amount (Satoshi)",
      renderAmount(details.minSendable, details.maxSendable),
    ]);
    if (details.commentAllowed && details.commentAllowed > 0) {
      elements.push(["Comment", renderComment()]);
    }
    if (details.payerData && details.payerData.name) {
      elements.push(["Name", renderName()]);
    }
    return elements;
  }

  function renderSuccessAction() {
    if (!successAction) return;
    let descriptionList;
    if (successAction.tag === "url") {
      descriptionList = [
        ["Description", successAction.description],
        [
          "Url",
          <>
            {successAction.url}
            <div className="mt-4">
              <Button
                onClick={() => {
                  if (successAction.url) utils.openUrl(successAction.url);
                }}
                label="Open"
                primary
              />
            </div>
          </>,
        ],
      ];
    } else if (successAction.tag === "message") {
      descriptionList = [["Message", successAction.message]];
    }

    return (
      <>
        <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
          {descriptionList &&
            descriptionList.map(([dt, dd], i) => (
              <Fragment key={`dl-item-${i}`}>
                <dt className="text-sm font-semibold text-gray-500">{dt}</dt>
                <dd className="text-sm mb-4 dark:text-white">{dd}</dd>
              </Fragment>
            ))}
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

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />
      {!loading && (
        <div className="p-4 max-w-screen-sm mx-auto">
          {!successAction ? (
            <>
              <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
                {elements().map(([t, d], i) => (
                  <Fragment key={`element-${i}`}>
                    <dt className="text-sm font-semibold text-gray-500">{t}</dt>
                    <dd className="text-sm mb-4 dark:text-white">{d}</dd>
                  </Fragment>
                ))}
              </dl>
              <div className="text-center">
                <div className="mb-5">
                  <Button
                    onClick={confirm}
                    label="Confirm"
                    fullWidth
                    primary
                    loading={loadingConfirm}
                    disabled={loadingConfirm || !valueMSat}
                  />
                </div>

                <p className="mb-3 underline text-sm text-gray-300">
                  Only connect with sites you trust.
                </p>

                <a
                  className="underline text-sm text-gray-500"
                  href="#"
                  onClick={reject}
                >
                  Cancel
                </a>
              </div>
            </>
          ) : (
            renderSuccessAction()
          )}
        </div>
      )}
    </div>
  );
}

export default LNURLPay;
