import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { wordlist } from "@scure/bip39/wordlists/english";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "~/app/components/form/Input";

type MnemonicInputsProps = {
  mnemonic?: string;
  setMnemonic?(mnemonic: string): void;
  readOnly?: boolean;
};

export default function MnemonicInputs({
  mnemonic,
  setMnemonic,
  readOnly,
  children,
}: React.PropsWithChildren<MnemonicInputsProps>) {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });
  const [revealedIndex, setRevealedIndex] = useState<number | undefined>(
    undefined
  );

  const words = mnemonic?.split(" ") || [];
  while (words.length < 12) {
    words.push("");
  }

  return (
    <div className="border-[1px] border-gray-200 rounded-lg py-8 px-4 flex flex-col gap-8 items-center justify-center w-[580px] self-center">
      <h3 className="font-semibold dark:text-white">{t("inputs.title")}</h3>
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {words.map((word, i) => {
          const isRevealed = revealedIndex === i;
          const inputId = `mnemonic-word-${i}`;
          return (
            <div key={i} className="flex justify-center items-center">
              <span className="w-7 text-gray-500 slashed-zero dark:text-neutral-500">
                {i + 1}.
              </span>
              <div className="relative">
                <Input
                  id={inputId}
                  autoFocus={!readOnly && i === 0}
                  onFocus={() => setRevealedIndex(i)}
                  onBlur={() => setRevealedIndex(undefined)}
                  readOnly={readOnly}
                  block={false}
                  className="w-24 text-center"
                  list={readOnly ? undefined : "wordlist"}
                  value={isRevealed ? word : word.length ? "•••••" : ""}
                  onChange={(e) => {
                    if (revealedIndex !== i) {
                      return;
                    }
                    words[i] = e.target.value;
                    setMnemonic?.(
                      words
                        .map((word) => word.trim())
                        .join(" ")
                        .trim()
                    );
                  }}
                  endAdornment={
                    <button
                      type="button"
                      tabIndex={-1}
                      className="mr-2"
                      onClick={() => document.getElementById(inputId)?.focus()}
                    >
                      {isRevealed ? (
                        <VisibleIcon className="h-6 w-6" />
                      ) : (
                        <HiddenIcon className="h-6 w-6" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
      {!readOnly && (
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
