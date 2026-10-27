import { CURRENCIES } from "~/common/constants";
import { decodeInvoice } from "~/common/utils/paymentRequest";
import state from "~/extension/background-script/state";
import { createPaymentRequest } from "~/fixtures/paymentRequests";
import type {
  AuthNotificationData,
  PaymentNotificationData,
  SettingsStorage,
} from "~/types";

import * as helpers from "../helpers";
import * as notifications from "../notifications";

jest.mock("../helpers");

jest.mock("~/extension/background-script/actions/cache/getCurrencyRate", () => {
  return {
    getCurrencyRateWithCache: jest.fn(() => Promise.resolve(0.00019233)),
  };
});

const settings: SettingsStorage = {
  browserNotifications: true,
  currency: CURRENCIES["USD"],
  exchange: "coindesk",
  locale: "en",
  showFiat: true,
  theme: "",
  userEmail: "",
  userName: "",
  websiteEnhancements: true,
  nostrEnabled: false,
};

const mockState = {
  settings,
};

describe("Payment notifications", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const data: PaymentNotificationData = {
    accountId: "12345",
    response: {
      data: {
        preimage:
          "3463336437663532393963353537396361623734643365663039386565346335",
        paymentHash:
          "979ab075ebd4b0be49df380ec7fadd14751c33afa1ffa0a6a22499aa819cb153",
        route: {
          total_amt: 1,
          total_fees: 0,
        },
      },
    },
    details: {
      destination:
        "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
    },
    paymentRequestDetails: {
      paymentRequest:
        "lnbc10n1p3st44mpp5j7dtqa0t6jctujwl8q8v07kaz363cva058l6pf4zyjv64qvuk9fshp5rdh2y59nhv3va0xqg7fmevcmypfw0e3pjq4p6yy52nu4jv76wmqqcqzpgxqyz5vqsp5lal7ervygjs3qpfvglzn472ag2e3w939mfckctpawsjyl3sslc6q9qyyssqvdjlxvgc0zrcn4ze44479x24w7r2svqv8zsp3ezemd55pdkxzwrjeeql0hvuy3d9klsmqzf8rwar8x4cplpxccnaj667p537g46txtqpxkyeuu",
      satoshi: 1,
      millisatoshi: 1000,
      timestamp: 1661327035,
      expiry: 86400,
      description: null,
      paymentHash:
        "979ab075ebd4b0be49df380ec7fadd14751c33afa1ffa0a6a22499aa819cb153",
    },
    origin: {
      location:
        "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/options.html#/send",
      domain: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan",
      host: "fbdjdcapmecooemonpmfohgeipnbcgan",
      pathname: "/options.html",
      name: "escapedcat@getalby.com",
      description: "",
      icon: "",
      metaData: {
        title: "Alby",
        url: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/options.html#/send",
      },
      external: true,
    },
  };

  test("success via lnaddress from popup", async () => {
    state.getState = jest.fn().mockReturnValue(mockState);
    const notifySpy = jest.spyOn(helpers, "notify");
    await notifications.paymentSuccessNotification(
      "ln.sendPayment.success",
      data
    );

    expect(notifySpy).toHaveBeenCalledWith({
      message: "Amount: 1 sat ($0.00)\nFee: 0 sats",
      title: "✅ Successfully paid to »escapedcat@getalby.com«",
    });
  });

  test("success via lnaddress from popup without fiat-conversion turned off", async () => {
    const mockStateNoFiat = {
      settings: { ...settings, showFiat: false },
    };

    state.getState = jest.fn().mockReturnValue(mockStateNoFiat);

    const notifySpy = jest.spyOn(helpers, "notify");
    await notifications.paymentSuccessNotification(
      "ln.sendPayment.success",
      data
    );

    expect(notifySpy).toHaveBeenCalledWith({
      message: "Amount: 1 sat\nFee: 0 sats",
      title: "✅ Successfully paid to »escapedcat@getalby.com«",
    });
  });

  test("success via lnaddress from popup without fiat-conversion turned on", async () => {
    const mockStateNoFiat = {
      settings: { ...settings },
    };

    state.getState = jest.fn().mockReturnValue(mockStateNoFiat);

    const notifySpy = jest.spyOn(helpers, "notify");
    await notifications.paymentSuccessNotification(
      "ln.sendPayment.success",
      data
    );

    expect(notifySpy).toHaveBeenCalledWith({
      message: "Amount: 1 sat ($0.00)\nFee: 0 sats",
      title: "✅ Successfully paid to »escapedcat@getalby.com«",
    });
  });

  test("success without origin skips receiver", async () => {
    state.getState = jest.fn().mockReturnValue(mockState);
    const notifySpy = jest.spyOn(helpers, "notify");
    const dataWitouthOrigin = { ...data };
    delete dataWitouthOrigin.origin;
    await notifications.paymentSuccessNotification(
      "ln.sendPayment.success",
      dataWitouthOrigin
    );

    expect(notifySpy).toHaveBeenCalledWith({
      message: "Amount: 1 sat ($0.00)\nFee: 0 sats",
      title: "✅ Successfully paid",
    });
  });

  // a connector may floor a sub-satoshi invoice to 0; the toast must show the
  // same rounded-up amount the allowance was checked and debited against
  test("uses the invoice amount rather than what the connector reports", async () => {
    state.getState = jest.fn().mockReturnValue(mockState);
    const notifySpy = jest.spyOn(helpers, "notify");
    await notifications.paymentSuccessNotification("ln.sendPayment.success", {
      ...data,
      paymentRequestDetails: decodeInvoice(createPaymentRequest(999)),
      response: {
        data: {
          preimage:
            "3463336437663532393963353537396361623734643365663039386565346335",
          paymentHash:
            "979ab075ebd4b0be49df380ec7fadd14751c33afa1ffa0a6a22499aa819cb153",
          route: {
            total_amt: 0,
            total_fees: 0,
          },
        },
      },
    });

    expect(notifySpy).toHaveBeenCalledWith({
      message: "Amount: 1 sat ($0.00)\nFee: 0 sats",
      title: "✅ Successfully paid to »escapedcat@getalby.com«",
    });
  });
});

describe("Auth notifications", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const data: AuthNotificationData = {
    authResponse: {
      status: "OK",
    },
    lnurlDetails: {
      tag: "login",
      k1: "42033a863825a495feed197ae2c9c3777b771695e7f2251983b323e5354246d6",
      domain: "lnurl.fiatjaf.com",
      url: "https://lnurl.fiatjaf.com/lnurl-login?tag=login&k1=42033a863825a495feed197ae2c9c3777b771695e7f2251983b323e5354246d6",
    },
  };

  test("success via login from popup", async () => {
    const notifySpy = jest.spyOn(helpers, "notify");
    notifications.lnurlAuthSuccessNotification("lnurl.auth.success", data);

    expect(notifySpy).toHaveBeenCalledWith({
      title: "✅ Login",
      message: "Successfully logged in to lnurl.fiatjaf.com",
    });
  });

  test("success via login from prompt with origin", async () => {
    const notifySpy = jest.spyOn(helpers, "notify");
    notifications.lnurlAuthSuccessNotification("lnurl.auth.success", {
      ...data,
      origin: {
        location: "https://lnurl.fiatjaf.com/",
        domain: "https://lnurl.fiatjaf.com",
        host: "lnurl.fiatjaf.com",
        pathname: "/",
        name: "lnurl fiatjaf",
        description: "",
        icon: "",
        metaData: {
          title: "lnurl playground",
          url: "https://lnurl.fiatjaf.com/",
          provider: "lnurl fiatjaf",
        },
        external: true,
      },
    });

    expect(notifySpy).toHaveBeenCalledWith({
      title: "✅ Login to lnurl fiatjaf",
      message: "Successfully logged in to lnurl.fiatjaf.com",
    });
  });
});
