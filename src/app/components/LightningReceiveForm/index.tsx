import Button from "@components/Button";
import Container from "@components/Container";
import DualCurrencyField from "@components/form/DualCurrencyField";
import TextField from "@components/form/TextField";
import { useTranslation } from "react-i18next";

type Props = React.FormHTMLAttributes<HTMLFormElement> & {
  handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  fiatAmount: string;
  handleChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
};

const LightningReceiveForm = ({
  handleSubmit,
  loading,
  fiatAmount,
  handleChange,
}: Props) => {
  const { t } = useTranslation("translation", { keyPrefix: "receive" });

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={loading}>
        <Container justifyBetween maxWidth="sm">
          <div className="">
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
              loading={loading}
              disabled={loading}
            />
          </div>
        </Container>
      </fieldset>
    </form>
  );
};

export default LightningReceiveForm;
