import { useMemo } from "react";
import useSWR from "swr";
import { ACCOUNT_DEFAULT_CURRENCY } from "~/common/constants";
import { AccountInfoRes, getAccountInfo } from "~/common/lib/api";
import { AccountInfo } from "~/types";

const getAccountInfoKey = (id: string | undefined): string | null =>
  id ? `accountInfo/${id}` : null;

const buildAccountInfo = (
  id: string | undefined,
  data: AccountInfoRes | undefined
): AccountInfo | null => {
  if (!id || !data) return null;

  const alias = data.info.alias;
  const { balance: resBalance, currency = ACCOUNT_DEFAULT_CURRENCY } =
    data.balance;
  const name = data.name;
  const balance =
    typeof resBalance === "number" ? resBalance : parseInt(resBalance); // TODO: handle amounts

  return {
    id,
    name,
    alias,
    balance,
    currency,
  };
};

export function useSelectedAccount(id: string | undefined) {
  const { data, mutate } = useSWR<AccountInfoRes>(
    getAccountInfoKey(id),
    getAccountInfo
  );

  const mutateAccountInfo = async () => {
    const data = await mutate();
    return buildAccountInfo(id, data);
  };

  // memoize, to keep useSWR memoized behaviour after creating a new object here
  const accountInfo = useMemo(() => buildAccountInfo(id, data), [id, data]);

  return {
    accountInfo,
    mutateAccountInfo,
  };
}
