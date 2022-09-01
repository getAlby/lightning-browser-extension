import { bech32 } from "bech32";

export function bech32Decode(str: string) {
  const { words: dataPart } = bech32.decode(str, 2000);
  const requestByteArray = bech32.fromWords(dataPart);
  return Buffer.from(requestByteArray).toString();
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
