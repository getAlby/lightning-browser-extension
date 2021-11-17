import React, { useState } from "react";
import axios from "axios";
import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useHistory } from "react-router-dom";

import utils from "../../../../common/lib/utils";

const url = process.env.GALOY_URL || "https://api.staging.galoy.io/graphql/";

export default function ConnectGaloy() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [smsCode, setSmsCode] = useState<string | undefined>();
  const [SmsCodeRequested, setSmsCodeRequested] = useState<
    string | undefined
  >();

  function handlePhoneNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPhoneNumber(event.target.value.trim());
  }

  function handleSmsCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSmsCode(event.target.value.trim());
  }

  async function requestSmsCode(event: React.MouseEvent<HTMLButtonElement>) {
    setLoading(true);
    const url = "https://api.staging.galoy.io/graphql/";
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
    const config = {
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post<any>(url, query, config);
    console.log(data);
    setSmsCodeRequested(data.data.userRequestAuthCode.success);
    setLoading(false);
  }

  async function requestAuthToken(event: React.MouseEvent<HTMLButtonElement>) {
    setLoading(true);
    const url = "https://api.staging.galoy.io/graphql/";
    const query = {
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
    const config = {
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post<any>(url, query, config);
    setLoading(false);
    saveAccount(data.data.userLogin.authToken);
  }

  async function saveAccount(authToken: string) {
    setLoading(true);

    const account = {
      name: "Galoy",
      config: {
        url,
        accessToken: authToken,
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
          history.push("/test-connection");
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
    <div className="relative lg:flex mt-24">
      <div className="lg:w-1/2">
        <h1 className="text-3xl font-bold">Connect to Galoy</h1>
        <p className="text-gray-500 mt-6"></p>
        <div className="w-4/5">
          <div className="mt-6">
            <label
              htmlFor="adminkey"
              className="block font-medium text-gray-700"
            >
              Enter your phone number
            </label>
            <div className="mt-1">
              <Input
                name="phone"
                type="tel"
                required
                onChange={handlePhoneNumberChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="url" className="block font-medium text-gray-700">
              Enter the SMS Code
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
        </div>
        <div className="mt-8 flex space-x-4">
          <Button
            label="Back"
            onClick={(e) => {
              e.preventDefault();
              history.goBack();
              return false;
            }}
          />
          <Button
            label={SmsCodeRequested || smsCode ? "Login" : "Request SMS Code"}
            primary
            loading={loading}
            disabled={!phoneNumber}
            onClick={
              SmsCodeRequested || smsCode ? requestAuthToken : requestSmsCode
            }
          />
        </div>
      </div>
      <div className="mt-16 lg:mt-0 lg:w-1/2">
        <div className="lg:flex h-full justify-center items-center">
          <img
            src="assets/icons/satsymbol.svg"
            alt="sat"
            className="max-w-xs"
          />
        </div>
      </div>
    </div>
  );
}
