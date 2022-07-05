import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";

import TransactionsTable from ".";
import type { Props } from ".";

const transactions: Props = {
  transactions: [
    {
      createdAt: "1656573909064",
      date: "5 days ago",
      description: "Polar Invoice for bob",
      host: "https://openai.com/dall-e-2/",
      id: "1",
      location: "https://openai.com/dall-e-2/",
      name: "Alby",
      preimage:
        "ecc5784b0834f7fcb244f789fe16356eb1121c301c7fc0aa5a7859285c1d1289",
      subTitle: "",
      title: "Alby",
      totalAmount: "1234000",
      totalAmountFiat: "$241.02",
      totalFees: "0",
      type: "sent",
    },
  ],
};

const invoices: Props = {
  transactions: [
    {
      id: "lnbcrt666660n1p3tad0hpp5kkguywerj5lqspc4p2a7f53yfnkuywxmxnuawe3lu4gdg0ezc2tqdqjd3sk6cn0ypkxzmtzducqzpgxqyz5vqsp529wvk52ckjkrfkll9q3w6ep6lrsg35se66jjpm5ssmumck7xxy6s9qyyssqzq3zsstfs7gzklgkdnxy2hsp4jfavw8xj4hv5300yww3053jx76h57e3ypsuvg36zwd49xm2nfr2lrfvylwrxs7yhpckjytvlaju0hsq7p9wna",
      type: "received",
      totalAmount: "66666",
      totalAmountFiat: "$13.02",
      preimage: "",
      title: "lambo lambo",
      date: "4 days ago",
    },
    {
      id: "lnbcrt888880n1p3tad30pp56j6g34wctydrfx4wwdwj3schell8uqug6jnlehlkpw02mdfd9wlqdq0v36k6urvd9hxwuccqzpgxqyz5vqsp5995q4egstsvnyetwvpax6jw8q0fnn4tyz3gp35k3yex29emhsylq9qyyssq0yxpx6peyn4vsepwj3l68w9sc5dqnkt07zff6aw4kqvcfs0fpu4jpfh929w6vqrgtjfkmrlwghq4s9t4mnwrh4dlkm6wjem5uq8eu4gpwqln0j",
      type: "received",
      totalAmount: "88888",
      totalAmountFiat: "$17.36",
      preimage: "",
      title: "dumplings",
      date: "5 days ago",
    },
    {
      id: "lnbcrt6543210n1p3tadjepp5rv6ufq4vumg66l9gcyxqhy89n6w90mx0mh6gcj0sawrf6xuep5ssdq5g9kxy7fqd9h8vmmfvdjscqzpgxqyz5vqsp5f9yzxeqjw33ule4rffuh0py32gjjsx8z48cd4xjl8ej3rn7zdtdq9qyyssqe6qvkfe260myc9ypgs5n63xzwcx82fderg8p5ysh6c2fvpz5xu4ksvhs5av0wwestk5pmucmhk8lpjhmy7wqyq9c29xgm9na2q5xv5spy5kukj",
      type: "received",
      totalAmount: "654321",
      totalAmountFiat: "$127.80",
      preimage: "",
      title: "Alby invoice",
      date: "6 days ago",
    },
  ],
};

describe("TransactionsTable", () => {
  test("renders transactions", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <TransactionsTable {...transactions} />
      </BrowserRouter>
    );

    expect(screen.getByText("Alby")).toBeInTheDocument();
    expect(screen.getByText(/sent - 5 days ago/)).toBeInTheDocument();
    expect(screen.getByText(/-1234000 sats/)).toBeInTheDocument();
    expect(screen.getByText(/~\$241.02/)).toBeInTheDocument();

    const disclosureButton = screen.getByRole("button");

    await act(() => {
      user.click(disclosureButton);
    });

    await waitFor(() =>
      expect(
        screen.getByText("https://openai.com/dall-e-2/")
      ).toBeInTheDocument()
    );
  });

  test("renders invoices", async () => {
    render(
      <BrowserRouter>
        <TransactionsTable {...invoices} />
      </BrowserRouter>
    );

    expect(screen.getByText("lambo lambo")).toBeInTheDocument();
    expect(screen.getByText(/received - 4 days ago/)).toBeInTheDocument();
    expect(screen.getByText(/\+66666 sats/)).toBeInTheDocument();
    expect(screen.getByText(/~\$13.02/)).toBeInTheDocument();

    const disclosureButtons = screen.queryByRole("button");
    expect(disclosureButtons).not.toBeInTheDocument();
  });
});
