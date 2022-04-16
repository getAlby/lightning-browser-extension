import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import utils from "../../../../common/lib/utils";

import Input from "../../../components/form/Input";
import ConnectorForm from "../../../components/ConnectorForm";

export const galoyUrls = {
  "galoy-bitcoin-beach": {
    label: "Bitcoin Beach Wallet",
    url:
      process.env.BITCOIN_BEACH_GALOY_URL ||
      "https://api.mainnet.galoy.io/graphql/",
  },
  "galoy-bitcoin-jungle": {
    label: "Bitcoin Jungle Wallet",
    url:
      process.env.BITCOIN_JUNGLE_GALOY_URL ||
      "https://api.mainnet.bitcoinjungle.app/graphql",
  },
} as const;

const defaultHeaders = {
  Accept: "application/json",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

type Props = {
  instance: keyof typeof galoyUrls;
};

export default function ConnectGaloy(props: Props) {
  const { instance } = props;
  const { url, label } = galoyUrls[instance];

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [smsCode, setSmsCode] = useState<string | undefined>();
  const [smsCodeRequested, setSmsCodeRequested] = useState<
    boolean | undefined
  >();
  const [jwt, setJwt] = useState<string | undefined>();
  const [acceptJwtDirectly, setAcceptJwtDirectly] = useState<
    boolean | undefined
  >();

  function handlePhoneNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPhoneNumber(event.target.value.trim());
  }

  function handleSmsCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSmsCode(event.target.value.trim());
  }

  function handleJwtChange(event: React.ChangeEvent<HTMLInputElement>) {
    setJwt(event.target.value.trim());
  }

  async function requestSmsCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const query = {
      query: `
        mutation userRequestAuthCode($input: UserRequestAuthCodeInput!) {
          userRequestAuthCode(input: $input) {
            errors {
              message
            }
            success
          }
        }
      `,
      variables: {
        input: {
          phone: phoneNumber,
        },
      },
    };

    try {
      const {
        data: { data, errors },
      } = await axios.post(url, query, {
        headers: defaultHeaders,
      });
      const errs = errors || data.userRequestAuthCode.errors;
      if (errs && errs.length) {
        console.error(errs);
        const errMessage = errs[0].message;

        const captchaRegex = /use captcha/;
        if (errMessage.match(captchaRegex)) {
          setAcceptJwtDirectly(true);
        } else {
          const alertMsg = `Failed to request a SMS code${
            errMessage ? `: ${errMessage}` : ""
          }`;
          alert(alertMsg);
        }
      } else {
        setSmsCodeRequested(data.userRequestAuthCode.success);
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        alert(`Failed to request a SMS code: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function requestAuthToken(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const authQuery = {
      query: `
        mutation userLogin($input: UserLoginInput!) {
          userLogin(input: $input) {
            errors {
                message
            }
            authToken
          }
        }
      `,
      variables: {
        input: {
          phone: phoneNumber,
          code: smsCode,
        },
      },
    };
    const meQuery = {
      query: `
          query getinfo {
            me {
              defaultAccount {
                defaultWalletId
              }
            }
          }
        `,
    };
    try {
      const { data: authData } = await axios.post(url, authQuery, {
        headers: defaultHeaders,
      });
      if (authData.error || authData.errors) {
        const error = authData.error || authData.errors;
        const errMessage = error?.errors?.[0]?.message || error?.[0]?.message;
        const errorMsg = `Failed to login with SMS code${
          errMessage ? `: ${errMessage}` : ""
        }`;
        throw new Error(errorMsg);
      }
      if (authData.data.userLogin.errors.length > 0) {
        throw new Error(authData.data.userLogin.errors[0].message);
      }
      const authToken = authData.data.userLogin.authToken as string;

      const { data: meData } = await axios.post(url, meQuery, {
        headers: {
          ...defaultHeaders,
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (meData.error || meData.errors) {
        const error = meData.error || meData.errors;
        console.error(error);
        const errMessage = error?.errors?.[0]?.message || error?.[0]?.message;
        const alertMsg = `Setup failed${errMessage ? `: ${errMessage}` : ""}`;
        alert(alertMsg);
      } else {
        const walletId = meData.data.me.defaultAccount.defaultWalletId;
        saveAccount({ authToken, walletId });
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        alert(`Setup failed: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loginWithJwt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const meQuery = {
      query: `
          query getinfo {
            me {
              defaultAccount {
                defaultWalletId
              }
            }
          }
        `,
    };
    try {
      if (!jwt) {
        const errorMsg = `JWT missing, couldn't log in.`;
        throw new Error(errorMsg);
      }
      const authToken = jwt;

      const { data: meData } = await axios.post(url, meQuery, {
        headers: {
          ...defaultHeaders,
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (meData.error || meData.errors) {
        const error = meData.error || meData.errors;
        console.error(error);
        const errMessage = error?.errors?.[0]?.message || error?.[0]?.message;
        const alertMsg = `Setup failed${errMessage ? `: ${errMessage}` : ""}`;
        alert(alertMsg);
      } else {
        const walletId = meData.data.me.defaultAccount.defaultWalletId;
        saveAccount({ authToken, walletId });
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        const unauthedRegex = /status code 401/;
        alert(
          `Setup failed: ${
            e.message.match(unauthedRegex) ? `invalid JWT passed` : e.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveAccount(config: { authToken: string; walletId: string }) {
    setLoading(true);

    const account = {
      name: label,
      config: {
        url,
        accessToken: config.authToken,
        walletId: config.walletId,
      },
      connector: "galoy",
    };

    try {
      const validation = await utils.call("validateAccount", account);
      if (validation.valid) {
        const addResult = await utils.call("addAccount", account);
        if (addResult.accountId) {
          await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          navigate("/test-connection");
        }
      } else {
        alert(`Connection failed (${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        alert(`Connection failed (${e.message})`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConnectorForm
      title={`Connect to ${label}`}
      submitLabel={
        smsCodeRequested || smsCode || acceptJwtDirectly || jwt
          ? "Login"
          : "Request SMS Code"
      }
      submitLoading={loading}
      submitDisabled={!phoneNumber}
      onSubmit={
        smsCodeRequested || smsCode
          ? requestAuthToken
          : acceptJwtDirectly || jwt
          ? loginWithJwt
          : requestSmsCode
      }
    >
      {!acceptJwtDirectly && (
        <div>
          <label htmlFor="adminkey" className="block font-medium text-gray-700">
            Enter your phone number
          </label>
          <div className="mt-1">
            <Input
              name="phone"
              type="tel"
              required
              placeholder="+503"
              disabled={smsCodeRequested}
              onChange={handlePhoneNumberChange}
            />
          </div>
        </div>
      )}
      {smsCodeRequested && (
        <div>
          <label htmlFor="url" className="block font-medium text-gray-700">
            Enter your SMS verification code
          </label>
          <div className="mt-1">
            <Input
              name="2fa"
              type="text"
              required
              onChange={handleSmsCodeChange}
            />
          </div>
        </div>
      )}
      {acceptJwtDirectly && (
        <div>
          <p>
            The {label} login is currently being upgraded. If you are an
            advanced user, you can grab your JWT token by logging in via the{" "}
            <a href="https://wallet.mainnet.galoy.io">
              Web Wallet (wallet.mainnet.galoy.io).
            </a>
          </p>
          <br />
          <p>
            The JWT looks like: <b>eyJhbG...</b>
          </p>
          <br />
          <label htmlFor="jwt" className="block font-medium text-gray-700">
            Enter your JWT token
          </label>
          <div className="mt-1">
            <Input name="jwt" type="text" required onChange={handleJwtChange} />
          </div>
        </div>
      )}
    </ConnectorForm>
  );
}
