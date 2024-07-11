import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import Hyperlink from "@components/Hyperlink";
import PublisherCard from "@components/PublisherCard";
import ResultCard from "@components/ResultCard";
import SatButtons from "@components/SatButtons";
import DualCurrencyField from "@components/form/DualCurrencyField";
import TextField from "@components/form/TextField";
import {
  PopiconsChevronBottomLine,
  PopiconsChevronLeftLine,
  PopiconsChevronTopLine,
} from "@popicons/react";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "~/app/components/Header";
import IconButton from "~/app/components/IconButton";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import lnurl from "~/common/lib/lnurl";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type {
  LNURLError,
  LNURLPayServiceResponse,
  LNURLPaymentInfo,
  LNURLPaymentSuccessAction,
  PaymentResponse,
} from "~/types";

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-800 dark:text-white">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 text-gray-600 dark:text-neutral-500 break-all">
    {children}
  </dd>
);

function LNURLPay() {
  const navState = useNavigationState();
  const details = navState.args?.lnurlDetails as LNURLPayServiceResponse;

  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getFormattedSats,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const navigate = useNavigate();
  const auth = useAccount();
  const { t } = useTranslation("translation", { keyPrefix: "lnurlpay" });
  const { t: tCommon } = useTranslation("common");

  const [valueSat, setValueSat] = useState(
    (details?.minSendable &&
      Math.floor(+details?.minSendable / 1000).toString()) ||
      ""
  );

  const amountMin = Math.floor(+details.minSendable / 1000);
  const amountMax = Math.floor(+details.maxSendable / 1000);
  const amountExceeded =
    (auth?.account?.currency || "BTC") !== "BTC"
      ? false
      : +valueSat > (auth?.account?.balance || 0);
  const rangeExceeded = +valueSat > amountMax || +valueSat < amountMin;

  const [showMoreFields, setShowMoreFields] = useState(false);
  const [fiatValue, setFiatValue] = useState("");
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successAction, setSuccessAction] = useState<
    LNURLPaymentSuccessAction | undefined
  >();

  useEffect(() => {
    const getFiat = async () => {
      const res = await getFormattedFiat(valueSat);
      setFiatValue(res);
    };

    getFiat();
  }, [valueSat, showFiat, getFormattedFiat]);

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
      const params: {
        amount: number;
        comment?: string;
        payerdata?: string;
      } = {
        amount: parseInt(valueSat) * 1000, // user specified sum in MilliSatoshi
        comment: comment && comment, // https://github.com/fiatjaf/lnurl-rfc/blob/luds/12.md
        payerdata: payerdata && JSON.stringify(payerdata), // https://github.com/fiatjaf/lnurl-rfc/blob/luds/18.md
      };

      let response;

      try {
        response = await axios.get<LNURLPaymentInfo | LNURLError>(
          details.callback,
          {
            params,
            // https://github.com/fiatjaf/lnurl-rfc/blob/luds/01.md#http-status-codes-and-content-type
            validateStatus: () => true,
            adapter: fetchAdapter,
          }
        );

        if (response.status >= 500) {
          toast.error("Payment aborted: Recipient server error");
          return;
        }

        const isSuccessResponse = function (
          obj: LNURLPaymentInfo | LNURLError
        ): obj is LNURLPaymentInfo {
          return Object.prototype.hasOwnProperty.call(obj, "pr");
        };

        if (!isSuccessResponse(response.data)) {
          toast.error(response.data.reason);
          return;
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
        amount: parseInt(valueSat) * 1000,
      });

      if (!isValidInvoice) {
        toast.error("Payment aborted: Invalid invoice.");
        return;
      }

      // LN WALLET pays the invoice, no additional user confirmation is required at this point
      const paymentResponse: PaymentResponse = await msg.request(
        "sendPayment",
        { paymentRequest },
        {
          origin: {
            ...navState.origin,
            name: getRecipient(),
          },
        }
      );

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
            toast.error(
              `Not implemented yet. Please submit an issue to support success action: ${paymentInfo.successAction.tag}`
            );
            break;
        }
      } else {
        setSuccessAction({ tag: "message", message: t("success") });
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

  function reject(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function close(e: React.MouseEvent<HTMLButtonElement>) {
    // will never be reached via prompt
    e.preventDefault();
    navigate(-1);
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

  function getImage() {
    if (!details?.metadata) return;

    try {
      const metadata = JSON.parse(details.metadata);
      const image = metadata.find(
        ([type]: [string]) =>
          type === "image/png;base64" || type === "image/jpeg;base64"
      );

      if (image) return `data:${image[0]},${image[1]}`;
    } catch (e) {
      console.error(e);
    }
  }

  function formattedMetadata(
    metadataJSON: string
  ): [string, string | React.ReactNode][] {
    try {
      const metadata = JSON.parse(metadataJSON);
      return metadata
        .map(([type, content]: [string, string]) => {
          if (type === "text/plain") {
            return [`${tCommon("description")}`, content];
          } else if (type === "text/long-desc") {
            return [
              `${tCommon("description_full")}`,
              <p key={type}>{content}</p>,
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

  function renderSuccessAction() {
    if (!successAction) return;
    const isMessage =
      successAction?.tag === "url" || successAction?.tag === "message";
    let descriptionList: [string, string | React.ReactNode][] = [];
    if (successAction.tag === "url") {
      descriptionList = [
        [`${tCommon("description")}`, successAction.description],
        [
          "URL",
          <>
            {successAction.url}
            <div className="mt-4">
              <Button
                onClick={() => {
                  if (successAction.url) utils.openUrl(successAction.url);
                }}
                label={tCommon("actions.open")}
                primary
              />
            </div>
          </>,
        ],
      ];
    } else if (successAction.tag === "message") {
      descriptionList = [[`${tCommon("message")}`, successAction.message]];
    }

    return (
      <Container justifyBetween maxWidth="sm">
        <div>
          <ResultCard
            isSuccess
            message={tCommon("success_message", {
              amount: getFormattedSats(valueSat),
              fiatAmount: showFiat ? ` (${fiatValue})` : ``,
              destination: navState.origin?.name || getRecipient(),
            })}
          />
          {isMessage && (
            <dl className="shadow bg-white dark:bg-surface-02dp mt-4 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
              {descriptionList.map(([dt, dd]) => (
                <>
                  <Dt>{dt}</Dt>
                  <Dd>{dd}</Dd>
                </>
              ))}
            </dl>
          )}
        </div>
        <div>
          <Button onClick={close} label={tCommon("actions.close")} fullWidth />
        </div>
      </Container>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

  function toggleShowMoreFields() {
    setShowMoreFields(!showMoreFields);
  }

  function showCommentField() {
    return (
      details &&
      typeof details.commentAllowed === "number" &&
      details.commentAllowed > 0
    );
  }

  function showNameField() {
    return !!details?.payerData?.name;
  }

  function showEmailField() {
    return !!details?.payerData?.email;
  }

  return (
    <>
      <div className="flex flex-col grow overflow-hidden">
        {!navState.isPrompt ? (
          <Header
            headerLeft={
              <IconButton
                onClick={() => navigate(-1)}
                icon={<PopiconsChevronLeftLine className="w-5 h-5" />}
              />
            }
          >
            {!successAction ? tCommon("actions.send") : tCommon("success")}
          </Header>
        ) : (
          <ScreenHeader
            title={
              !successAction ? tCommon("actions.send") : tCommon("success")
            }
          />
        )}
        {!successAction ? (
          <>
            <div className="grow overflow-y-auto no-scrollbar">
              <Container justifyBetween maxWidth="sm">
                <PublisherCard
                  title={navState.origin?.name}
                  description={getRecipient()}
                  image={navState.origin?.icon || getImage()}
                />
                <form onSubmit={handleSubmit} className="flex grow">
                  <div className="grow flex flex-col justify-between">
                    <fieldset disabled={loadingConfirm}>
                      <dl className="mt-4 overflow-hidden">
                        <>
                          {formattedMetadata(details.metadata).map(
                            ([dt, dd], i) => (
                              <Fragment key={`element-${i}`}>
                                <Dt>{dt}</Dt>
                                <Dd>{dd}</Dd>
                              </Fragment>
                            )
                          )}
                          {details.minSendable === details.maxSendable && (
                            <>
                              <Dt>{t("amount.label")}</Dt>
                              <Dd>
                                {getFormattedSats(
                                  Math.floor(+details.minSendable / 1000)
                                )}
                              </Dd>
                            </>
                          )}
                        </>
                      </dl>
                      {details &&
                        details.minSendable !== details.maxSendable && (
                          <div>
                            <DualCurrencyField
                              autoFocus
                              id="amount"
                              label={t("amount.label")}
                              min={amountMin}
                              max={amountMax}
                              rangeExceeded={rangeExceeded}
                              value={valueSat}
                              onChange={(e) => setValueSat(e.target.value)}
                              fiatValue={fiatValue}
                              hint={`${tCommon("balance")}: ${auth
                                ?.balancesDecorated?.accountBalance}`}
                              amountExceeded={amountExceeded}
                            />
                            <SatButtons
                              min={amountMin}
                              max={amountMax}
                              onClick={setValueSat}
                              disabled={loadingConfirm}
                            />
                          </div>
                        )}

                      {showCommentField() && (
                        <div className="mt-4">
                          <TextField
                            id="comment"
                            label={t("comment.label")}
                            placeholder={tCommon("optional")}
                            onChange={(e) => {
                              setComment(e.target.value);
                            }}
                          />
                        </div>
                      )}

                      {(showNameField() || showEmailField()) && (
                        <div className="flex justify-center mt-4 caret-transparent">
                          <Hyperlink onClick={toggleShowMoreFields}>
                            {tCommon("actions.more")}{" "}
                            {showMoreFields ? (
                              <PopiconsChevronTopLine className="h-5 w-5 inline-flex" />
                            ) : (
                              <PopiconsChevronBottomLine className="h-5 w-5 inline-flex" />
                            )}
                          </Hyperlink>
                        </div>
                      )}

                      {showMoreFields && (
                        <div className="mb-4">
                          {showNameField() && (
                            <div className="mt-4">
                              <TextField
                                id="name"
                                label={t("name.label")}
                                placeholder={tCommon("optional")}
                                value={userName}
                                onChange={(e) => {
                                  setUserName(e.target.value);
                                }}
                              />
                            </div>
                          )}
                          {showEmailField() && (
                            <div className="mt-4">
                              <TextField
                                id="email"
                                label={t("email.label")}
                                placeholder={tCommon("optional")}
                                value={userEmail}
                                onChange={(e) => {
                                  setUserEmail(e.target.value);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </fieldset>
                    <div className="mt-2 dark:border-white/10">
                      <ConfirmOrCancel
                        isFocused={false}
                        label={tCommon("actions.confirm")}
                        loading={loadingConfirm}
                        disabled={
                          loadingConfirm || amountExceeded || rangeExceeded
                        }
                        onCancel={reject}
                      />
                    </div>
                  </div>
                </form>
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
