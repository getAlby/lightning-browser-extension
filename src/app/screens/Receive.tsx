import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import CaretLeftIcon from "@bitcoin-design/bitcoin-icons/svg/filled/caret-left.svg";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Input from "../components/Form/Input";
import Header from "../components/Header";

function Receive() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    expiration: "",
  });

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  return (
    <div>
      <Header
        title="Receive"
        headerLeft={
          <IconButton
            onClick={() => history.push("/home")}
            icon={
              <img
                className="w-4 h-4"
                src={CaretLeftIcon}
                alt=""
                aria-hidden="true"
              />
            }
          />
        }
      />
      <div className="p-4">
        <div className="mt-2 mb-4">
          <label htmlFor="amount" className="block text-gray-700">
            Amount
          </label>
          <div className="mt-1">
            <Input
              name="amount"
              placeholder="Enter amount..."
              type="text"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <Input
              name="description"
              placeholder="Who is sending this payment?"
              type="text"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="expiration" className="block text-gray-700">
            Expiration
          </label>
          <div className="mt-1">
            <select
              className="w-full py-3 border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              name="expiration"
              value={formData.expiration}
              onChange={handleChange}
            >
              <option key="60" value="60">
                1 hour
              </option>
              <option key="120" value="120">
                2 hours
              </option>
              <option key="180" value="180">
                3 hours
              </option>
            </select>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="mb-4">
            <Button
              onClick={() => alert("i should create an invoice...")}
              label="Create Invoice"
              fullWidth
              primary
            />
          </div>
          <a
            className="underline text-sm text-gray-500"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              history.push("/home");
            }}
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}

export default Receive;
