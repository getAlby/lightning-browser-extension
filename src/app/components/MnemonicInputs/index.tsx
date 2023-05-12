import { wordlist } from "@scure/bip39/wordlists/english";
import { useTranslation } from "react-i18next";
import Input from "~/app/components/form/Input";

type MnemonicInputsProps = {
  mnemonic?: string;
  setMnemonic?(mnemonic: string): void;
  disabled?: boolean;
};

export default function MnemonicInputs({
  mnemonic,
  setMnemonic,
  disabled,
  children,
}: React.PropsWithChildren<MnemonicInputsProps>) {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  const words = mnemonic?.split(" ") || [];
  while (words.length < 12) {
    words.push("");
  }

  return (
    <div className="border-[1px] border-gray-200 rounded-lg py-8 px-4 flex flex-col gap-8 items-center justify-center w-[520px] self-center">
      <h3 className="font-semibold dark:text-white">{t("inputs.title")}</h3>
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {[...new Array(12)].map((_, i) => (
          <div key={i} className="flex justify-center items-center">
            <span className="w-7 text-gray-500 slashed-zero dark:text-neutral-500">
              {i + 1}.
            </span>
            <Input
              type="text"
              required
              placeholder={wordlist[i * 32]}
              disabled={disabled}
              block={false}
              className="w-24 text-center"
              autoComplete=""
              list={disabled ? undefined : "wordlist"}
              value={words[i]}
              onChange={(e) => {
                words[i] = e.target.value;
                setMnemonic?.(
                  words
                    .map((word) => word.trim())
                    .join(" ")
                    .trim()
                );
              }}
            />
          </div>
        ))}
      </div>
      {!disabled && (
        <datalist id="wordlist">
          {wordlist.map((word) => (
            <option key={word} value={word} />
          ))}
        </datalist>
      )}
      {children}
    </div>
  );
}
