import {
  CaretLeftIcon,
  CheckIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import Loading from "@components/Loading";
import TabComponent from "@components/Tab";
import DualCurrencyField from "@components/form/DualCurrencyField";
import TextField from "@components/form/TextField";
import { Tab } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { isAlbyAccount } from "~/app/utils";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import { poll } from "~/common/utils/helpers";

function Receive() {
  const { t } = useTranslation("translation", { keyPrefix: "receive" });
  const { t: tCommon } = useTranslation("common");

  const auth = useAccount();

  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "0",
    description: "",
    expiration: "",
  });
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<{
    paymentRequest: string;
    rHash: string;
  } | null>();
  const [copyLabel, setCopyLabel] = useState(tCommon("actions.copy") as string);
  const [paid, setPaid] = useState(false);
  const [pollingForPayment, setPollingForPayment] = useState(false);
  const mounted = useRef(false);
  const [recieveType, setRecieveType] = useState("lightning");
  const isAlbyUser = isAlbyAccount(auth.account?.alias);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const [fiatAmount, setFiatAmount] = useState("");

  useEffect(() => {
    if (formData.amount !== "" && showFiat) {
      (async () => {
        const res = await getFormattedFiat(formData.amount);
        setFiatAmount(res);
      })();
    }
  }, [formData, showFiat, getFormattedFiat]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function checkPayment(paymentHash: string) {
    setPollingForPayment(true);
    poll({
      fn: () =>
        msg.request("checkPayment", { paymentHash }) as Promise<{
          paid: boolean;
        }>,
      validate: (payment) => payment.paid,
      interval: 3000,
      maxAttempts: 20,
      shouldStopPolling: () => !mounted.current,
    })
      .then(() => {
        setPaid(true);
        auth.fetchAccountInfo(); // Update balance.
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setPollingForPayment(false);
      });
  }

  function setDefaults() {
    setFormData({
      amount: "0",
      description: "",
      expiration: "",
    });
    setPaid(false);
    setPollingForPayment(false);
    setInvoice(null);
  }

  async function createInvoice() {
    try {
      setLoading(true);
      const response = await api.makeInvoice({
        amount: formData.amount,
        memo: formData.description,
      });
      setInvoice(response);
      checkPayment(response.rHash);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createInvoice();
  }

  function renderInvoice() {
    if (!invoice) return null;
    return (
      <div className="py-4">
        <div className="relative p-8  bg-white rounded-lg shadow-sm ring-1 ring-black ring-opacity-5 flex justify-center items-center overflow-hidden">
          <QRCode value={invoice.paymentRequest.toUpperCase()} level="M" />
          {paid && (
            <div className="absolute inset-0 flex justify-center items-center bg-white/90">
              <div className="text-center">
                <div className="inline-block bg-green-bitcoin p-1 rounded-full mb-2">
                  <CheckIcon className="w-7 h-7 text-white" />
                </div>
                <p className="text-lg font-bold">{t("success")}</p>
              </div>
            </div>
          )}
        </div>
        {paid && (
          <div className="my-4">
            <Button
              type="submit"
              label={tCommon("actions.receive_again")}
              primary
              fullWidth
              onClick={() => {
                setDefaults();
                navigate("/receive");
              }}
            />
          </div>
        )}
        {!paid && (
          <>
            <div className="mt-8 mb-4 flex justify-center">
              <Button
                onClick={async () => {
                  try {
                    navigator.clipboard.writeText(invoice.paymentRequest);
                    setCopyLabel(tCommon("copied"));
                    setTimeout(() => {
                      setCopyLabel(tCommon("actions.copy"));
                    }, 1000);
                  } catch (e) {
                    if (e instanceof Error) {
                      toast.error(e.message);
                    }
                  }
                }}
                icon={<CopyIcon className="w-6 h-6 mr-2" />}
                label={copyLabel}
              />
            </div>

            <div className="flex justify-center">
              {pollingForPayment && (
                <div className="flex items-center space-x-2 dark:text-white">
                  <Loading />
                  <span>{t("payment.waiting")}</span>
                </div>
              )}

              {!pollingForPayment && (
                <Button
                  onClick={() => checkPayment(invoice.rHash)}
                  label={t("payment.status")}
                />
              )}
            </div>
          </>
        )}
        {paid && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            onConfettiComplete={(confetti) => {
              confetti && confetti.reset();
            }}
            style={{ pointerEvents: "none" }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        title={t("title")}
        headerLeft={
          <IconButton
            onClick={() => {
              invoice ? setDefaults() : navigate(-1);
            }}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />

      {isAlbyUser ? (
        <Container maxWidth="sm">
          <div className=" h-full mx-auto">
            <Tab.Group>
              <Tab.List className="flex mb-6 mt-4 items-center  px-4">
                <TabComponent
                  active={recieveType === "lightning"}
                  onClick={() => {
                    setRecieveType("lightning");
                  }}
                  leftTab={true}
                  icon={
                    <svg
                      width="16"
                      height="18"
                      viewBox="0 0 16 18"
                      className={
                        recieveType === "lightning"
                          ? " text-gray-700 dark:text-neutral-200"
                          : " text-gray-500 dark:text-neutral-500 hover:text-gray-700 "
                      }
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.4961 7.70883L5.8603 16.5885C5.6207 16.8349 5.22228 16.5503 5.37764 16.2437L8.45182 10.1779C8.55296 9.97833 8.40795 9.74227 8.18423 9.74227H1.71762C1.45129 9.74227 1.31702 9.42108 1.5041 9.23153L9.51318 1.11699C9.74554 0.881572 10.132 1.14034 10.0029 1.44487L7.70601 6.86069C7.62148 7.06 7.76944 7.28049 7.98592 7.2778L14.2773 7.19969C14.5444 7.19638 14.6823 7.51738 14.4961 7.70883Z"
                        stroke="#374151"
                      />
                    </svg>
                  }
                  label="Lightning"
                ></TabComponent>

                <TabComponent
                  active={recieveType === "onchain"}
                  onClick={() => {
                    setRecieveType("onchain");
                  }}
                  rightTab={true}
                  icon={
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      className={
                        recieveType === "onchain"
                          ? "text-gray-700 dark:text-neutral-200 "
                          : " text-gray-500 dark:text-neutral-500 hover:text-gray-700 "
                      }
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.5391 15.5524H20.0391V15.5646L20.0397 15.5767L20.5391 15.5524ZM20.5391 8.67606L20.0396 8.65319L20.0391 8.66462V8.67606H20.5391ZM20.1845 16.196L19.9388 15.7605V15.7605L20.1845 16.196ZM13.0531 20.2197L12.8074 19.7843L13.0531 20.2197ZM10.9969 20.2223L11.2415 19.7863H11.2415L10.9969 20.2223ZM3.82019 16.1968L4.06479 15.7607L3.82019 16.1968ZM3.4649 15.5374L3.96369 15.5722L3.9649 15.5548V15.5374H3.4649ZM3.4649 8.69449H3.9649V8.67657L3.96362 8.65869L3.4649 8.69449ZM3.80999 8.0397L4.06182 8.47166H4.06182L3.80999 8.0397ZM10.9665 3.86752L11.2183 4.29947V4.29947L10.9665 3.86752ZM13.0833 3.87025L12.8303 4.30155V4.30155L13.0833 3.87025ZM20.1945 8.04063L19.9416 8.47193V8.47193L20.1945 8.04063ZM21.0391 15.5524V8.67606H20.0391V15.5524H21.0391ZM20.4302 16.6314C20.8561 16.3911 21.0591 15.9507 21.0385 15.5281L20.0397 15.5767C20.0434 15.6522 20.0093 15.7207 19.9388 15.7605L20.4302 16.6314ZM13.2988 20.6552L20.4302 16.6314L19.9388 15.7605L12.8074 19.7843L13.2988 20.6552ZM10.7523 20.6584C11.5435 21.1022 12.5088 21.101 13.2988 20.6552L12.8074 19.7843C12.3216 20.0584 11.728 20.0591 11.2415 19.7863L10.7523 20.6584ZM3.57558 16.6329L10.7523 20.6584L11.2415 19.7863L4.06479 15.7607L3.57558 16.6329ZM2.96612 15.5026C2.93601 15.9338 3.13912 16.3881 3.57558 16.6329L4.06479 15.7607C3.99274 15.7203 3.95829 15.6496 3.96369 15.5722L2.96612 15.5026ZM2.9649 8.69449V15.5374H3.9649V8.69449H2.9649ZM3.96362 8.65869C3.95816 8.5826 3.99128 8.51278 4.06182 8.47166L3.55817 7.60775C3.13191 7.85626 2.93565 8.30488 2.96619 8.73029L3.96362 8.65869ZM4.06182 8.47166L11.2183 4.29947L10.7146 3.43557L3.55817 7.60775L4.06182 8.47166ZM11.2183 4.29947C11.7166 4.00897 12.3328 4.00977 12.8303 4.30155L13.3362 3.43894C12.5271 2.96443 11.525 2.96314 10.7146 3.43557L11.2183 4.29947ZM12.8303 4.30155L19.9416 8.47193L20.4474 7.60933L13.3362 3.43894L12.8303 4.30155ZM19.9416 8.47193C20.0103 8.51226 20.043 8.57944 20.0396 8.65319L21.0386 8.69893C21.0576 8.2839 20.8612 7.85196 20.4474 7.60932L19.9416 8.47193Z"
                        fill="#6B7280"
                      />
                      <path
                        d="M3.82019 9.25312C3.3487 8.98865 3.34307 8.31197 3.81009 8.03969L10.9665 3.86751C11.6209 3.48605 12.43 3.48709 13.0834 3.87024L20.1946 8.04062C20.6596 8.31329 20.6539 8.98739 20.1845 9.25227L13.0531 13.276C12.4152 13.636 11.6357 13.637 10.9969 13.2786L3.82019 9.25312Z"
                        stroke="#6B7280"
                      />
                    </svg>
                  }
                  label="Onchain"
                ></TabComponent>
              </Tab.List>
              <Tab.Panels className="h-full">
                <Tab.Panel className="h-full">
                  {invoice ? (
                    <Container maxWidth="sm">{renderInvoice()}</Container>
                  ) : (
                    <form onSubmit={handleSubmit} className="h-full">
                      <fieldset className="h-full" disabled={loading}>
                        <Container justifyBetween maxWidth="sm">
                          <div className="py-4">
                            <div className="mb-4">
                              <DualCurrencyField
                                id="amount"
                                min={0}
                                label={t("amount.label")}
                                placeholder={t("amount.placeholder")}
                                fiatValue={fiatAmount}
                                onChange={handleChange}
                                autoFocus
                              />
                            </div>

                            <div className="mb-4">
                              <TextField
                                id="description"
                                label={t("description.label")}
                                placeholder={t("description.placeholder")}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="mb-8">
                            <Button
                              type="submit"
                              label={t("actions.create_invoice")}
                              fullWidth
                              primary
                              loading={loading}
                              disabled={loading}
                            />
                          </div>
                        </Container>
                      </fieldset>
                    </form>
                  )}
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Container justifyBetween maxWidth="sm">
                    <div className="py-8 text-center dark:text-neutral-200">
                      <div className="mb-8">
                        <p>
                          To receive Bitcoin on-chain, log-in to{" "}
                          <strong>Alby Account </strong>on getalby.com
                        </p>
                      </div>

                      <div className="mb-8">
                        <p>
                          Your bitcoin on-chain address is under{" "}
                          <strong>Receive</strong> page, accessible from{" "}
                          <strong>Payments</strong>
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 ">
                      <a href="https://getalby.com/node/receive">
                        <Button
                          type="submit"
                          label={"Go Alby Account on getalby.com ->"}
                          fullWidth
                          primary
                          loading={loading}
                          disabled={loading}
                        />
                      </a>
                    </div>
                  </Container>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </Container>
      ) : (
        <div className=" h-full">
          {invoice ? (
            <Container maxWidth="sm">{renderInvoice()}</Container>
          ) : (
            <form onSubmit={handleSubmit} className=" h-full">
              <fieldset className="h-full" disabled={loading}>
                <Container justifyBetween maxWidth="sm">
                  <div className="py-4">
                    <div className="mb-4">
                      <DualCurrencyField
                        id="amount"
                        min={0}
                        label={t("amount.label")}
                        placeholder={t("amount.placeholder")}
                        fiatValue={fiatAmount}
                        onChange={handleChange}
                        autoFocus
                      />
                    </div>

                    <div className="mb-4">
                      <TextField
                        id="description"
                        label={t("description.label")}
                        placeholder={t("description.placeholder")}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="mb-8">
                    <Button
                      type="submit"
                      label={t("actions.create_invoice")}
                      fullWidth
                      primary
                      loading={loading}
                      disabled={loading}
                    />
                  </div>
                </Container>
              </fieldset>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default Receive;
