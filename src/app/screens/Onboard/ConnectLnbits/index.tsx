import { useState } from "react";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";

import utils from "../../../../common/lib/utils";
import TextField from "../../../components/Form/TextField";

export default function ConnectLnbits() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminkey: "",
    url: "https://legend.lnbits.com",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { adminkey, url } = formData;
    const account = {
      name: "LNBits",
      config: {
        adminkey,
        url,
      },
      connector: "lnbits",
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
        console.log(validation);
        alert(
          `Connection failed. Do you have the correct URL and Admin Key? \n\n(${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      let message =
        "Connection failed. Do you have the correct URL and Admin Key?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative lg:flex mt-14 bg-white dark:bg-gray-800 px-10 py-12">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white">
            Connect to LNbits
          </h1>
          <p className="text-gray-500 mt-6"></p>
          <div className="w-4/5">
            <div className="mt-6">
              <TextField
                id="adminkey"
                label="LNbits Admin Key"
                type="text"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mt-6">
              <TextField
                id="url"
                label="LNbits URL"
                type="text"
                value={formData.url}
                required
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <div className="lg:flex h-full justify-center items-center">
            <img src="assets/icons/satsymbol.svg" alt="sat" className="w-64" />
          </div>
        </div>
      </div>
      <div className="my-8 flex space-x-4 justify-center">
        <Button
          label="Back"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
            return false;
          }}
        />
        <Button
          type="submit"
          label="Continue"
          primary
          loading={loading}
          disabled={formData.adminkey === "" || formData.url === ""}
        />
      </div>
    </form>
  );
}
