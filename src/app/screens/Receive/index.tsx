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
import DualCurrencyField from "@components/form/DualCurrencyField";
import TextField from "@components/form/TextField";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { isAlbyLNDHubAccount, isAlbyOAuthAccount } from "~/app/utils";
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
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [loadingLightningAddress, setLoadingLightningAddress] = useState(false);
  const [invoice, setInvoice] = useState<{
    paymentRequest: string;
    rHash: string;
  } | null>();
  const [copyInvoiceLabel, setCopyInvoiceLabel] = useState(
    tCommon("actions.copy_invoice") as string
  );
  const [copyLightningAddressLabel, setCopyLightningAddressLabel] = useState(
    t("actions.copy_lightning_address") as string
  );
  const [lightningAddress, setLightningAddress] = useState("");
  const [paid, setPaid] = useState(false);
  const [pollingForPayment, setPollingForPayment] = useState(false);
  const mounted = useRef(false);
  const isAlbyUser =
    isAlbyOAuthAccount(auth.account?.connectorType) ||
    isAlbyLNDHubAccount(auth.account?.alias, auth.account?.connectorType);

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
      setLoadingInvoice(true);
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
      setLoadingInvoice(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createInvoice();
  }

  async function getLightningAddress() {
    setLoadingLightningAddress(true);
    const response = await api.getAccountInfo();
    const lightningAddress = response.info.lightning_address;
    if (lightningAddress) setLightningAddress(lightningAddress);
    setLoadingLightningAddress(false);
  }

  useEffect(() => {
    getLightningAddress();
  }, []);

  function renderInvoice() {
    if (!invoice) return null;
    return (
      <div className="py-4">
        <div className="relative p-8 bg-white rounded-lg shadow-sm ring-1 ring-black ring-opacity-5 flex justify-center items-center overflow-hidden">
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
                    setCopyInvoiceLabel(tCommon("copied"));
                    setTimeout(() => {
                      setCopyInvoiceLabel(tCommon("actions.copy_invoice"));
                    }, 1000);
                  } catch (e) {
                    if (e instanceof Error) {
                      toast.error(e.message);
                    }
                  }
                }}
                icon={<CopyIcon className="w-6 h-6 mr-2" />}
                label={copyInvoiceLabel}
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
      {invoice ? (
        <Container maxWidth="sm">{renderInvoice()}</Container>
      ) : (
        <div className="pt-4">
          <form onSubmit={handleSubmit}>
            <fieldset disabled={loadingInvoice}>
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
                <div className="mb-4">
                  <Button
                    type="submit"
                    label={t("actions.create_invoice")}
                    fullWidth
                    primary
                    loading={loadingInvoice}
                    disabled={loadingInvoice}
                  />
                </div>
              </Container>
            </fieldset>
          </form>
          {isAlbyUser && (
            <div>
              <Container justifyBetween maxWidth="sm">
                <div className="relative flex  items-center mb-8">
                  <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                  <span className="flex-shrink mx-4  text-gray-500 dark:text-gray-400 fw-bold">
                    {tCommon("or")}
                  </span>
                  <div className="flex-grow border-t  border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="mb-4">
                  <Button
                    type="button"
                    label={t("redeem_lnurl")}
                    fullWidth
                    onClick={() => {
                      navigate("/lnurlRedeem");
                    }}
                  />
                </div>

                <div className="mb-4">
                  <Button
                    type="button"
                    label={copyLightningAddressLabel}
                    disabled={loadingLightningAddress}
                    fullWidth
                    onClick={async () => {
                      try {
                        if (!lightningAddress) {
                          throw new Error(
                            "User does not have a lightning address"
                          );
                        }
                        navigator.clipboard.writeText(lightningAddress);
                        setCopyLightningAddressLabel(tCommon("copied"));
                        setTimeout(() => {
                          setCopyLightningAddressLabel(
                            t("actions.copy_lightning_address")
                          );
                        }, 1000);
                      } catch (e) {
                        if (e instanceof Error) {
                          toast.error(e.message);
                        }
                      }
                    }}
                    icon={<CopyIcon className="w-6 h-6 mr-2" />}
                  />
                </div>

                <div className="mb-4">
                  <Button
                    type="button"
                    label={t("receive_via_bitcoin_address")}
                    fullWidth
                    onClick={() => {
                      navigate("/onChainReceive");
                    }}
                  />
                </div>
              </Container>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Receive;
