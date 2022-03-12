import React, { useState, useEffect, MouseEvent } from "react";
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
import TextField from "../components/Form/TextField";
import PublisherCard from "../components/PublisherCard";

type Origin = {
  name: string;
  icon: string;
};

type Props = {
  details?: LNURLPayServiceResponse;
  origin?: Origin;
};

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-500">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 dark:text-white">{children}</dd>
);

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
  const [valueSat, setValueSat] = useState(
    (details?.minSendable && (+details?.minSendable / 1000).toString()) || ""
  );
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
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
            if (lnurlDetails.minSendable) {
              setValueSat((+lnurlDetails.minSendable / 1000).toString());
            }
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
        amount: parseInt(valueSat) * 1000, // user specified sum in MilliSatoshi
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
        amount: parseInt(valueSat) * 1000,
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
        {
          origin: {
            ...origin,
            name: getRecipient(),
          },
        }
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

  function getRecipient() {
    if (!details?.metadata) return;
    try {
      const metadata = JSON.parse(details.metadata);
      const identifier = metadata.find(
        ([type]: [string]) => type === "text/identifier"
      );
      if (identifier) return identifier[1];
    } catch (e) {
      console.error(e);
    }
    return details.domain;
  }

  function formattedMetadata(
    metadataJSON: string
  ): [string, string | React.ReactNode][] {
    try {
      const metadata = JSON.parse(metadataJSON);
      return metadata
        .map(([type, content]: [string, string]) => {
          if (type === "text/plain") {
            return ["Description", content];
          } else if (type === "text/long-desc") {
            return ["Full Description", <p key={type}>{content}</p>];
          }
          return undefined;
        })
        .filter(Boolean);
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  function renderSuccessAction() {
    if (!successAction) return;
    let descriptionList: [string, string | React.ReactNode][] = [];
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
          {descriptionList.map(([dt, dd]) => (
            <>
              <Dt>{dt}</Dt>
              <Dd>{dd}</Dd>
            </>
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
      <PublisherCard
        title={origin.name}
        description={origin.description}
        image={origin.icon}
      />
      <div className="p-4 max-w-screen-sm mx-auto">
        {!successAction ? (
          <>
            <div className="shadow bg-white dark:bg-gray-700 py-4 px-4 rounded-lg mb-6 overflow-hidden">
              <dl>
                {loading || !details ? (
                  <>
                    <Dt>Send payment to</Dt>
                    <Dd>loading...</Dd>
                    <Dt>Description</Dt>
                    <Dd>loading...</Dd>
                    <Dt>Amount (Satoshi)</Dt>
                    <Dd>loading...</Dd>
                  </>
                ) : (
                  <>
                    <Dt>Send payment to</Dt>
                    <Dd>{getRecipient()}</Dd>
                    {formattedMetadata(details.metadata).map(([dt, dd]) => (
                      <>
                        <Dt>{dt}</Dt>
                        <Dd>{dd}</Dd>
                      </>
                    ))}
                    {details.minSendable === details.maxSendable && (
                      <>
                        <Dt>Amount (Satoshi)</Dt>
                        <Dd>{`${+details.minSendable / 1000} sat`}</Dd>
                      </>
                    )}
                  </>
                )}
              </dl>
              {details && details.minSendable !== details.maxSendable && (
                <div>
                  <TextField
                    id="amount"
                    label="Amount (Satoshi)"
                    type="number"
                    min={+details.minSendable / 1000}
                    max={+details.maxSendable / 1000}
                    value={valueSat}
                    onChange={(e) => setValueSat(e.target.value)}
                  />
                  <div className="flex space-x-1.5 mt-2">
                    <Button
                      fullWidth
                      label="100 sat⚡"
                      onClick={() => setValueSat("100")}
                    />
                    <Button
                      fullWidth
                      label="1K sat⚡"
                      onClick={() => setValueSat("1000")}
                    />
                    <Button
                      fullWidth
                      label="5K sat⚡"
                      onClick={() => setValueSat("5000")}
                    />
                    <Button
                      fullWidth
                      label="10K sat⚡"
                      onClick={() => setValueSat("10000")}
                    />
                  </div>
                </div>
              )}
              {details && details?.commentAllowed > 0 && (
                <div className="mt-4">
                  <TextField
                    id="comment"
                    label="Comment"
                    placeholder="optional"
                    onChange={(e) => {
                      setComment(e.target.value);
                    }}
                  />
                </div>
              )}
              {details && details?.payerData?.name && (
                <div className="mt-4">
                  <TextField
                    id="name"
                    label="Name"
                    placeholder="optional"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                    }}
                  />
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="mb-5">
                <Button
                  onClick={confirm}
                  label="Confirm"
                  fullWidth
                  primary
                  loading={loadingConfirm}
                  disabled={loadingConfirm || !valueSat}
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
    </div>
  );
}

export default LNURLPay;
