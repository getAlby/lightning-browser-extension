import Alert from "@components/Alert";
import BudgetControl from "@components/BudgetControl";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PaymentSummary, { Dd, Dt } from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import Checkbox from "@components/form/Checkbox";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import type { OriginData } from "~/types";

const ConfirmRequestPermission: FC = () => {
  const [alwaysAllow, setAlwaysAllow] = useState(false);

  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_request_permission",
  });
  const { t: tCommon } = useTranslation("common");
  const { t: tPayment } = useTranslation("translation", {
    keyPrefix: "confirm_payment",
  });
  const { t: tPermissions } = useTranslation("permissions");
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const navState = useNavigationState();
  const origin = navState.origin as OriginData;

  const { method, description, params, showBudgetControl, alwaysConfirm } =
    navState.args?.requestPermission ?? {};

  const { amount: rawAmount, ...rest } = params ?? {};
  const amount = rawAmount != null ? Number(rawAmount) : undefined;
  const otherParams = params ? Object.entries(rest) : [];

  const [rememberMe, setRememberMe] = useState(false);
  const [budget, setBudget] = useState(((amount || 0) * 10).toString());
  const [fiatAmount, setFiatAmount] = useState("");
  const [fiatBudgetAmount, setFiatBudgetAmount] = useState("");

  useEffect(() => {
    (async () => {
      if (showFiat && amount) {
        setFiatAmount(await getFormattedFiat(amount));
      }
    })();
  }, [amount, showFiat, getFormattedFiat]);

  useEffect(() => {
    (async () => {
      if (showFiat && budget) {
        setFiatBudgetAmount(await getFormattedFiat(budget));
      }
    })();
  }, [budget, showFiat, getFormattedFiat]);

  const enable = async () => {
    if (showBudgetControl && rememberMe && budget) {
      await msg.request("addAllowance", {
        totalBudget: parseInt(budget),
        host: origin.host,
        name: origin.name,
        imageURL: origin.icon,
      });
    }

    msg.reply({
      enabled: showBudgetControl ? rememberMe : alwaysAllow,
      blocked: false,
    });
  };

  const reject = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    enable();
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <form onSubmit={handleSubmit} className="h-full">
        <Container justifyBetween maxWidth="sm">
          <div>
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={origin.host}
              isSmall={false}
            />
            <div className="flex flex-col gap-4 dark:text-white py-4">
              <p>{t("allow")}</p>
              <div className="center dark:text-white">
                <p className="font-semibold">{method}</p>
                {description && (
                  <p className="text-sm text-gray-700 dark:text-neutral-500">
                    {tPermissions(
                      description as unknown as TemplateStringsArray
                    )}
                  </p>
                )}
              </div>
              {amount !== undefined && (
                <div className="p-4 shadow bg-white dark:bg-surface-02dp rounded-lg">
                  <PaymentSummary amount={amount} fiatAmount={fiatAmount} />
                </div>
              )}
              {otherParams.length > 0 && (
                <div className="p-4 shadow bg-white dark:bg-surface-02dp rounded-lg">
                  <dl className="space-y-4">
                    {otherParams.map(([key, value]) => (
                      <div key={key}>
                        <Dt>{t(`params.${key}`, { defaultValue: key })}</Dt>
                        <Dd>{value}</Dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              {alwaysConfirm && (
                <Alert type="warn">
                  <p className="text-sm">{t("always_confirm_warning")}</p>
                </Alert>
              )}
            </div>
          </div>
          <div className="text-center flex flex-col">
            {showBudgetControl && (
              <BudgetControl
                fiatAmount={fiatBudgetAmount}
                remember={rememberMe}
                onRememberChange={(event) => {
                  setRememberMe(event.target.checked);
                }}
                budget={budget}
                onBudgetChange={(event) => setBudget(event.target.value)}
              />
            )}
            {!alwaysConfirm && !showBudgetControl && (
              <div className="flex items-center mb-4">
                <Checkbox
                  id="always_allow"
                  name="always_allow"
                  checked={alwaysAllow}
                  onChange={() => setAlwaysAllow((prev) => !prev)}
                />
                <label
                  htmlFor="always_allow"
                  className="cursor-pointer pl-2 block text-sm text-gray-900 font-medium dark:text-white"
                >
                  {t("always_allow")}
                </label>
              </div>
            )}
            <ConfirmOrCancel
              label={
                amount !== undefined
                  ? tPayment("actions.pay_now")
                  : tCommon("actions.confirm")
              }
              onCancel={reject}
            />
          </div>
        </Container>
      </form>
    </div>
  );
};

export default ConfirmRequestPermission;
