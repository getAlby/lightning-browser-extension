import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UnlockIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import utils from "../../../common/lib/utils";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Input from "../../components/Form/Input";

function Unlock() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const from = location.state?.from?.pathname || "/";

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
    auth
      .unlock(password, () => {
        navigate(from, { replace: true });
      })
      .catch((e) => {
        setError(e.message);
      });
  }

  return (
    <div className="p-8 text-center">
      <UnlockIcon className="inline mb-4 h-16 w-16 text-blue-500" />
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
