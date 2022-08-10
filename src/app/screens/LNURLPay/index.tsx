import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SatButtons from "@components/SatButtons";
import DualCurrencyField from "@components/form/DualCurrencyField";
import TextField from "@components/form/TextField";
import axios from "axios";
import React, { useState, useEffect, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import lnurl from "~/common/lib/lnurl";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import {
  LNURLPaymentInfoError,
  LNURLPaymentInfo,
  LNURLPaymentSuccessAction,
  LNURLPayServiceResponse,
  PaymentResponse,
} from "~/types";

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-800 dark:text-white">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 text-gray-600 dark:text-neutral-500">{children}</dd>
);

function LNURLPay() {
  const navState = useNavigationState();
  const details = navState.args?.lnurlDetails as LNURLPayServiceResponse;

  const { isLoading: isLoadingSettings, settings } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const navigate = useNavigate();
  const auth = useAccount();

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
    if (showFiat) {
      (async () => {
        const res = await getFiatValue(valueSat);
        setFiatValue(res);
      })();
    }
  }, [valueSat, showFiat]);

  useEffect(() => {
    !!settings.userName && setUserName(settings.userName);
    !!settings.userEmail && setUserEmail(settings.userEmail);
  }, [settings.userName, settings.userEmail]);

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
            ...navState.origin,
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
      if (navState.isPrompt) {
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
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function close(e: MouseEvent) {
    e.preventDefault();
    if (navState.isPrompt) {
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
      <div className="h-full">
        <PublisherCard
          title={navState.origin.name}
          description={navState.origin.description}
          lnAddress={getRecipient()}
          image={navState.origin.icon}
          isSmall={false}
        />
        <dl className="shadow bg-white dark:bg-surface-02dp m-4 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
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
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col grow overflow-hidden">
        {!successAction ? (
          <>
            <div className="grow overflow-y-auto no-scrollbar">
              <PublisherCard
                title={navState.origin.name}
                image={navState.origin.icon}
                lnAddress={getRecipient()}
              />
              <Container maxWidth="sm">
                <div className="my-4">
                  <dl>
                    <>
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
                </div>
              </Container>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-white/10">
              <ConfirmOrCancel
                label="Confirm"
                loading={loadingConfirm}
                disabled={loadingConfirm || !valueSat}
                onConfirm={confirm}
                onCancel={reject}
              />
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
