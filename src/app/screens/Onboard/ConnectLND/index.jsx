import React, { useState } from "react";
import Input from "../../../components/Form/input";
import Button from "../../../components/button";
import { useHistory } from "react-router-dom";

const initialFormData = Object.freeze({
  routeUrl: "",
  macaroon: "",
});

export default function ConnectLnd() {
  const history = useHistory();
  const [formData, setFormData] = useState(initialFormData);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function handleSubmit(event) {
    console.log(formData);
    const { routeUrl, macaroon } = formData;
    // Do something with the formData...

    history.push("/test-connection");
    event.preventDefault();
  }

  return (
    <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="relative">
        <div className="h-32">
          <img className="mb-12" src="https://i.ibb.co/3F3mCkR/logox.png" />
        </div>
        <h1 className="text-3xl font-bold mt-4">Connect to your remote node</h1>
        <p className="text-base text-gray-500 mt-6">
          You will need to retreive the node url and an admin macaroon. Not sure
          where to find these details?
        </p>
        <p className="text-base text-orange-bitcoin mt-2">
          Check out this guides.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Route URL
              </label>
              <div>
                <Input name="routeUrl" onChange={handleChange} required />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Macaroon
              </label>
              <div className="mt-1">
                <Input name="macaroon" onChange={handleChange} required />
              </div>
            </div>
          </div>
          <div className="mt-8 w-2/5">
            <Button type="submit" label="Continue" />
          </div>
        </form>
      </div>

      <div
        className="mt-10 -mx-4 relative lg:mt-0 lg:flex lg:items-center"
        aria-hidden="true"
      >
        <img src="https://i.ibb.co/QfF1PP6/Frame-20.png" />
      </div>
    </div>
  );
}
