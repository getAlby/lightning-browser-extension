import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import i18n from "~/../tests/unit/helpers/i18n";
import { SettingsProvider } from "~/app/context/SettingsContext";

import type { Props } from ".";
import TransactionsTable from ".";

jest.mock("~/common/lib/api", () => {
  const original = jest.requireActual("~/common/lib/api");
  return {
    ...original,
    getSettings: jest.fn(() => Promise.resolve(mockSettings)),
    getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })),
  };
});

const transactions: Props = {
  transactions: [
    {
      timestamp: 1656573909064,
      createdAt: "1656573909064",
      date: "5 days ago",
      description: "Polar Invoice for bob",
      host: "https://openai.com/dall-e-2/",
      id: "1",
      location: "https://openai.com/dall-e-2/",
      name: "Alby",
      preimage:
        "ecc5784b0834f7fcb244f789fe16356eb1121c301c7fc0aa5a7859285c1d1289",
      title: "Alby",
      totalAmount: "1234000",
      totalAmountFiat: "$241.02",
      totalFees: 0,
      type: "sent",
    },
  ],
};

const invoices: Props = {
  transactions: [
    {
      id: "lnbcrt666660n1p3tad0hpp5kkguywerj5lqspc4p2a7f53yfnkuywxmxnuawe3lu4gdg0ezc2tqdqjd3sk6cn0ypkxzmtzducqzpgxqyz5vqsp529wvk52ckjkrfkll9q3w6ep6lrsg35se66jjpm5ssmumck7xxy6s9qyyssqzq3zsstfs7gzklgkdnxy2hsp4jfavw8xj4hv5300yww3053jx76h57e3ypsuvg36zwd49xm2nfr2lrfvylwrxs7yhpckjytvlaju0hsq7p9wna",
      timestamp: 1656573909064,
      type: "received",
      totalAmount: "66666",
      totalAmountFiat: "$13.02",
      preimage: "",
      title: "lambo lambo",
      date: "4 days ago",
    },
    {
      id: "lnbcrt6543210n1p3tadjepp5rv6ufq4vumg66l9gcyxqhy89n6w90mx0mh6gcj0sawrf6xuep5ssdq5g9kxy7fqd9h8vmmfvdjscqzpgxqyz5vqsp5f9yzxeqjw33ule4rffuh0py32gjjsx8z48cd4xjl8ej3rn7zdtdq9qyyssqe6qvkfe260myc9ypgs5n63xzwcx82fderg8p5ysh6c2fvpz5xu4ksvhs5av0wwestk5pmucmhk8lpjhmy7wqyq9c29xgm9na2q5xv5spy5kukj",
      timestamp: 1656573909064,
      type: "received",
      totalAmount: "654321",
      totalAmountFiat: "$127.80",
      preimage: "",
      title: "Alby invoice",
      date: "6 days ago",
    },
  ],
};

const invoicesWithBoostagram: Props = {
  transactions: [
    {
      id: "lnbcrt666660n1p3tad0hpp5kkguywerj5lqspc4p2a7f53yfnkuywxmxnuawe3lu4gdg0ezc2tqdqjd3sk6cn0ypkxzmtzducqzpgxqyz5vqsp529wvk52ckjkrfkll9q3w6ep6lrsg35se66jjpm5ssmumck7xxy6s9qyyssqzq3zsstfs7gzklgkdnxy2hsp4jfavw8xj4hv5300yww3053jx76h57e3ypsuvg36zwd49xm2nfr2lrfvylwrxs7yhpckjytvlaju0hsq7p9wna",
      timestamp: 1656573909064,
      type: "received",
      totalAmount: "66666",
      totalAmountFiat: "$13.02",
      preimage: "",
      title: "lambo lambo",
      date: "4 days ago",
    },
    {
      id: "lnbcrt888880n1p3tad30pp56j6g34wctydrfx4wwdwj3schell8uqug6jnlehlkpw02mdfd9wlqdq0v36k6urvd9hxwuccqzpgxqyz5vqsp5995q4egstsvnyetwvpax6jw8q0fnn4tyz3gp35k3yex29emhsylq9qyyssq0yxpx6peyn4vsepwj3l68w9sc5dqnkt07zff6aw4kqvcfs0fpu4jpfh929w6vqrgtjfkmrlwghq4s9t4mnwrh4dlkm6wjem5uq8eu4gpwqln0j",
      timestamp: 1656573909064,
      type: "received",
      totalAmount: "88888",
      totalAmountFiat: "$17.36",
      preimage: "",
      title: "dumplings",
      date: "5 days ago",
      boostagram: {
        app_name: "Fountain",
        name: "Friedemann",
        podcast: "Honigdachs",
        url: "https://coinspondent.de/honigdachs-der-bitcoin-podcast-aus-leipzig",
        episode: undefined,
        itemID: undefined,
        ts: undefined,
        message: "Du bist so 1 geiles podcast 100%",
        sender_id: "123456",
        sender_name: "bumi@getalby.com",
        time: "00:00",
        action: "boost",
        value_msat_total: 123456,
      },
    },
  ],
};

describe("TransactionsTable", () => {
  test("renders transactions", async () => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <SettingsProvider>
            <TransactionsTable {...transactions} />
          </SettingsProvider>
        </I18nextProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("Alby")).toBeInTheDocument();
    expect(screen.getByText(/5 days ago/)).toBeInTheDocument();
    expect(await screen.findByText(/- 1,234,000 sats/)).toBeInTheDocument();
    expect(await screen.findByText(/~\$241.02/)).toBeInTheDocument();
  });

  test("renders invoice without boostagram", async () => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <SettingsProvider>
            <TransactionsTable {...invoices} />
          </SettingsProvider>
        </I18nextProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText("lambo lambo")).toBeInTheDocument();
    expect(await screen.findByText(/4 days ago/)).toBeInTheDocument();
    expect(await screen.findByText(/\+ 66,666 sats/)).toBeInTheDocument();
    expect(await screen.findByText(/~\$13.02/)).toBeInTheDocument();

    const disclosureButtons = screen.queryByRole("button");
    expect(disclosureButtons).not.toBeInTheDocument();
  });

  test("renders invoice with boostagram", async () => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <SettingsProvider>
            <TransactionsTable {...invoicesWithBoostagram} />
          </SettingsProvider>
        </I18nextProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("dumplings")).toBeInTheDocument();
    expect(screen.getByText(/5 days ago/)).toBeInTheDocument();
    expect(await screen.findByText(/\+ 88,888 sats/)).toBeInTheDocument();
    expect(await screen.findByText(/~\$17.36/)).toBeInTheDocument();
  });
});
