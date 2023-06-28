import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import type { MessageMnemonicGenerate } from "~/types";

const generateMnemonic = async (message: MessageMnemonicGenerate) => {
  return {
    data: bip39.generateMnemonic(wordlist, 128),
  };
};

export default generateMnemonic;
