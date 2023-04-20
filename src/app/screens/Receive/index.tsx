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
import Tab from "@components/Tab";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LightningReceiveForm from "~/app/components/LightningReceiveForm";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import BlockIcon from "~/app/icons/BlockIcon";
import ThunderIcon from "~/app/icons/ThunderIcon";
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
          <div className="h-auto mx-auto my-0 w-48">
            <QRCode
              value={invoice.paymentRequest.toUpperCase()}
              level="M"
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
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
        <Tab.Group>
          <Tab.List className="flex mb-6 mt-4 items-center px-4">
            <Tab icon={<ThunderIcon />} label="Lightning" />
            <Tab icon={<BlockIcon />} label="Onchain" />
          </Tab.List>
          <Tab.Panels className="h-full">
            <Tab.Panel className="h-full">
              {invoice ? (
                <Container maxWidth="sm">{renderInvoice()}</Container>
              ) : (
                <LightningReceiveForm
                  handleSubmit={handleSubmit}
                  handleChange={handleChange}
                  loading={loading}
                  fiatAmount={fiatAmount}
                />
              )}
            </Tab.Panel>
            <Tab.Panel className="h-full">
              <Container justifyBetween maxWidth="sm">
                <div className="text-center dark:text-neutral-200 h-full flex flex-col justify-center items-center">
                  <div className="mb-8">
                    <p>
                      To receive Bitcoin on-chain, log-in to your{" "}
                      <strong>Alby Account </strong>at getalby.com
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
                <div className="mb-4">
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
      ) : (
        <div className=" h-full">
          {invoice ? (
            <Container maxWidth="sm">{renderInvoice()}</Container>
          ) : (
            <LightningReceiveForm
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              loading={loading}
              fiatAmount={fiatAmount}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Receive;
