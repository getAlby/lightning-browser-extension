import Button from "@components/Button";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SatButtons from "@components/SatButtons";
import DualCurrencyField from "@components/form/DualCurrencyField";
import TextField from "@components/form/TextField";
import axios from "axios";
import React, { useState, useEffect, MouseEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import lnurl from "~/common/lib/lnurl";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import getOriginData from "~/extension/content-script/originData";
import {
  LNURLPaymentInfoError,
  LNURLPaymentInfo,
  LNURLPaymentSuccessAction,
  LNURLPayServiceResponse,
  PaymentResponse,
} from "~/types";

type Origin = {
  name: string;
  icon: string;
};

type Props = {
  details?: LNURLPayServiceResponse;
  origin?: Origin;
};

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-800 dark:text-white">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 text-gray-600 dark:text-neutral-500">{children}</dd>
);

function LNURLPay(props: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAccount();
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

  const [fiatValue, setFiatValue] = useState("");
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successAction, setSuccessAction] = useState<
    LNURLPaymentSuccessAction | undefined
  >();
  const [payment, setPayment] = useState<PaymentResponse | undefined>();

  useEffect(() => {
    (async () => {
      const res = await getFiatValue(valueSat);
      setFiatValue(res);
    })();
  }, [valueSat]);

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
      if (response.userEmail) {
        setUserEmail(response.userEmail);
      }
    });
  }, []);

  const getPayerData = (details: LNURLPayServiceResponse) => {
    if (
      userName?.length &&
      userEmail?.length &&
      details.payerData?.email &&
      details.payerData?.name
    ) {
      return { name: userName, email: userEmail };
    } else if (userName?.length && details.payerData?.name) {
      return { name: userName };
    } else if (userEmail?.length && details.payerData?.email) {
      return { email: userEmail };
    } else {
      return undefined;
    }
  };

  async function confirm() {
    if (!details) return;

    const payerdata = getPayerData(details);

    try {
      setLoadingConfirm(true);
      // Get the invoice
      const params = {
        amount: parseInt(valueSat) * 1000, // user specified sum in MilliSatoshi
        comment, // https://github.com/fiatjaf/lnurl-rfc/blob/luds/12.md
        payerdata, // https://github.com/fiatjaf/lnurl-rfc/blob/luds/18.md
      };

      let response;

      try {
        response = await axios.get<LNURLPaymentInfo | LNURLPaymentInfoError>(
          details.callback,
          {
            params,
            // https://github.com/fiatjaf/lnurl-rfc/blob/luds/01.md#http-status-codes-and-content-type
            validateStatus: () => true,
          }
        );

        const isSuccessResponse = function (
          obj: LNURLPaymentInfo | LNURLPaymentInfoError
        ): obj is LNURLPaymentInfo {
          return Object.prototype.hasOwnProperty.call(obj, "pr");
        };

        if (!isSuccessResponse(response.data)) {
          throw new Error(response.data.reason);
        }
      } catch (e) {
        const message = e instanceof Error ? `(${e.message})` : "";
        toast.error(`Payment aborted: Could not fetch invoice. \n${message}`);
        return;
      }

      const paymentInfo = response.data;
      const paymentRequest = paymentInfo.pr;

      const isValidInvoice = lnurl.verifyInvoice({
        paymentInfo,
        metadata: details.metadata,
        amount: parseInt(valueSat) * 1000,
        payerdata,
      });

      if (!isValidInvoice) {
        toast.warn("Payment aborted: Invalid invoice.");
        return;
      }

      // LN WALLET pays the invoice, no additional user confirmation is required at this point
      const paymentResponse: PaymentResponse = await utils.call(
        "sendPayment",
        { paymentRequest },
        {
          origin: {
            ...origin,
            name: getRecipient(),
          },
        }
      );

      setPayment(paymentResponse);

      // Once payment is fulfilled LN WALLET executes a non-null successAction
      // LN WALLET should also store successAction data on the transaction record
      if (paymentInfo.successAction) {
        switch (paymentInfo.successAction.tag) {
          case "url":
          case "message":
            setSuccessAction(paymentInfo.successAction);
            break;
          case "aes": // TODO: For aes, LN WALLET must attempt to decrypt a ciphertext with payment preimage
          default:
            toast.warn(
              `Not implemented yet. Please submit an issue to support success action: ${paymentInfo.successAction.tag}`
            );
            break;
        }
      } else {
        setSuccessAction({ tag: "message", message: "Success, payment sent!" });
      }

      auth.fetchAccountInfo(); // Update balance.

      // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the payment response. This closes the window which means the user will NOT see the above successAction.
      // We assume this is OK when it is called through webln.
      if (props.details && props.origin) {
        msg.reply(paymentResponse);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
      }
    } finally {
      setLoadingConfirm(false);
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    if (props.details && props.origin) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function close(e: MouseEvent) {
    e.preventDefault();
    if (props.details && props.origin) {
      msg.reply(payment);
    } else {
      window.close();
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
        <PublisherCard
          title={origin.name}
          description={origin.description}
          image={origin.icon}
        />
        <Container maxWidth="sm">
          <dl className="shadow bg-white dark:bg-surface-02dp mt-4 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
            {descriptionList.map(([dt, dd]) => (
              <>
                <Dt>{dt}</Dt>
                <Dd>{dd}</Dd>
              </>
            ))}
          </dl>
          <div className="text-center">
            <button className="underline text-sm text-gray-500" onClick={close}>
              Close
            </button>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col grow overflow-hidden">
        {!successAction ? (
          <>
            <div className="grow overflow-y-auto no-scrollbar">
              <PublisherCard
                title={origin.name}
                description={origin.description}
                image={origin.icon}
              />
              <Container maxWidth="sm">
                <div className="my-4">
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
                            <Dd>{`${+details.minSendable / 1000} sats`}</Dd>
                          </>
                        )}
                      </>
                    )}
                  </dl>
                  {details && details.minSendable !== details.maxSendable && (
                    <div>
                      <DualCurrencyField
                        id="amount"
                        label="Amount (Satoshi)"
                        min={+details.minSendable / 1000}
                        max={+details.maxSendable / 1000}
                        value={valueSat}
                        onChange={(e) => setValueSat(e.target.value)}
                        fiatValue={fiatValue}
                      />
                      <SatButtons onClick={setValueSat} />
                    </div>
                  )}
                  {details &&
                    typeof details?.commentAllowed === "number" &&
                    details?.commentAllowed > 0 && (
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
                  {details && details?.payerData?.email && (
                    <div className="mt-4">
                      <TextField
                        id="email"
                        label="Email"
                        placeholder="optional"
                        value={userEmail}
                        onChange={(e) => {
                          setUserEmail(e.target.value);
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <p className="mb-2 text-sm text-gray-400">
                      <em>Only connect with sites you trust.</em>
                    </p>

                    <a
                      className="underline text-sm text-gray-600 dark:text-neutral-400"
                      href="#"
                      onClick={reject}
                    >
                      Cancel
                    </a>
                  </div>
                </div>
              </Container>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-white/10">
              <Container maxWidth="sm">
                <Button
                  onClick={confirm}
                  label="Confirm"
                  fullWidth
                  primary
                  disabled={loadingConfirm || !valueSat}
                  loading={loadingConfirm}
                />
              </Container>
            </div>
          </>
        ) : (
          renderSuccessAction()
        )}
      </div>
    </>
  );
}

export default LNURLPay;
