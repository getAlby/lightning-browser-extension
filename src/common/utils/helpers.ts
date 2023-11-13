import * as secp256k1 from "@noble/secp256k1";
import { bech32 } from "bech32";
import { ConnectorTransaction } from "~/extension/background-script/connectors/connector.interface";
import { Sender } from "~/types";

export function bech32Decode(str: string, encoding: BufferEncoding = "utf-8") {
  const { words: dataPart } = bech32.decode(str, 2000);
  const requestByteArray = bech32.fromWords(dataPart);
  return Buffer.from(requestByteArray).toString(encoding);
}

export function bech32Encode(prefix: string, hex: string) {
  const data = secp256k1.etc.hexToBytes(hex);
  const words = bech32.toWords(data);
  return bech32.encode(prefix, words, 1000);
}

export function getHostFromSender(sender: Sender) {
  // see https://github.com/uBlockOrigin/uBlock-issues/issues/1992
  // If present, use MessageSender.origin to determine whether the port is
  // from a privileged page, otherwise use MessageSender.url
  // MessageSender.origin is more reliable as it is not spoofable by a
  // compromised renderer.
  if (sender.origin) return new URL(sender.origin).host;
  else if (sender.url) return new URL(sender.url).host;
  else return null;
}

export async function poll<T>({
  fn,
  validate,
  interval,
  maxAttempts,
  shouldStopPolling,
}: {
  fn: () => Promise<T>;
  validate: (value: T) => boolean;
  interval: number;
  maxAttempts: number;
  shouldStopPolling: () => boolean;
}) {
  let attempts = 0;

  const executePoll = async (
    resolve: (value: unknown) => void,
    reject: (reason?: Error) => void
  ) => {
    if (shouldStopPolling()) {
      return reject(new Error("Polling aborted manually"));
    }
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error("Exceeded max attempts"));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
}

export function mergeTransactions(
  invoices: ConnectorTransaction[],
  payments: ConnectorTransaction[]
): ConnectorTransaction[] {
  const mergedTransactions = [...invoices, ...payments].sort((a, b) => {
    return b.settleDate - a.settleDate;
  });

  return mergedTransactions;
}
