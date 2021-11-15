import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockOpenIcon } from "@heroicons/react/solid";

import utils from "../../../common/lib/utils";
import Button from "../../components/Button";
import Input from "../../components/Form/Input";

function Unlock({ next = "/home" }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handlePasswordChange(event) {
    setError(null);
    setPassword(event.target.value);
  }

  function handleSubmit(event) {
    unlock();
    event.preventDefault();
  }

  function reset() {
    utils.openPage("welcome.html");
  }

  function unlock() {
    utils
      .call("unlock", { password })
      .then(() => {
        navigate(next);
      })
      .catch((e) => {
        setError(e.message);
      });
  }

  return (
    <div className="p-8 text-center">
      <LockOpenIcon
        className="inline mb-4 h-16 w-16 text-blue-500"
        aria-hidden="true"
      />
      <h2 className="text-2xl font-bold mb-4">Unlock:</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            placeholder="Password"
            size="small"
            type="password"
            autoFocus
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <Button
          type="submit"
          label="unlock"
          fullWidth
          primary
          disabled={password === ""}
        />
      </form>
      {error && (
        <p>
          {error} (
          <span
            onClick={(event) => {
              reset();
            }}
          >
            config
          </span>
          )
        </p>
      )}
    </div>
  );
}

export default Unlock;
