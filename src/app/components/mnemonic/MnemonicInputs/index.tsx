import { wordlist } from "@scure/bip39/wordlists/english";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import Checkbox from "~/app/components/form/Checkbox";
import Input from "~/app/components/form/Input";

type MnemonicInputsProps = {
  mnemonic?: string;
  setMnemonic?(mnemonic: string): void;
  readOnly?: boolean;
  isConfirmed?: (confirmed: boolean) => void;
};

export default function MnemonicInputs({
  mnemonic,
  setMnemonic,
  readOnly,
  children,
  isConfirmed,
}: React.PropsWithChildren<MnemonicInputsProps>) {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });
  const [revealedIndex, setRevealedIndex] = useState<number | undefined>(
    undefined
  );
  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);

  const words = mnemonic?.split(" ") || [];
  while (words.length < 12) {
    words.push("");
  }
  while (words.length > 12) {
    words.pop();
  }

  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 items-center justify-center">
      <h3 className="text-lg font-semibold dark:text-white">
        {t("inputs.title")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 justify-center">
        {words.map((word, i) => {
          const isRevealed = revealedIndex === i;
          const inputId = `mnemonic-word-${i}`;
          return (
            <div key={i} className="flex justify-center items-center gap-0.5">
              <span className="w-7 text-gray-600 dark:text-neutral-400">
                {i + 1}.
              </span>
              <div className="w-full">
                <Input
                  id={inputId}
                  autoFocus={!readOnly && i === 0}
                  onFocus={() => setRevealedIndex(i)}
                  onBlur={() => setRevealedIndex(undefined)}
                  readOnly={readOnly}
                  block={false}
                  className="w-full text-center"
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
                    <PasswordViewAdornment
                      isRevealed={isRevealed}
                      onChange={(passwordView) => {
                        if (passwordView) {
                          document.getElementById(inputId)?.focus();
                        }
                      }}
                    />
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

      {isConfirmed && (
        <div className="flex items-center justify-center mt-4">
          <Checkbox
            id="has_backed_up"
            name="Backup confirmation checkbox"
            checked={hasConfirmedBackup}
            onChange={(event) => {
              setHasConfirmedBackup(event.target.checked);
              if (isConfirmed) isConfirmed(event.target.checked);
            }}
          />
          <label
            htmlFor="has_backed_up"
            className="cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white"
          >
            {t("confirm")}
          </label>
        </div>
      )}
    </div>
  );
}
