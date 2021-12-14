import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import utils from "../../../common/lib/utils";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import TextButton from "../../components/TextButton";
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
    <div className="p-8  text-center bg-white shadow-lg">
      <div className="flex space-x-2 justify-center pt-5">
        <img src="assets/icons/alby_icon_transp.svg" alt="logo" />
      </div>
      <p className="text-xl font-normal text-dark-bitcoin font-serif mt-8 mb-5  ">
        Unlock to continue
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
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
          label="Unlock"
          fullWidth
          primary
          disabled={password === ""}
        />
        <div className="flex space-x-1 justify-center mt-7">
          <TextButton
            label="Restore Account?"
            primary
            className="flex-auto font-serif font-bold  text-base"
          />
          <span className="flex-none text-text-gray-bitcoin">or</span>

          <TextButton
            label="Connect Wallet here"
            primary
            className="flex-auto font-serif font-bold  text-base"
          />
        </div>

        <div className="flex justify-center space-x-1 mt-5">
          <span className="text-text-gray-bitcoin ">Need help? Contact </span>
          <TextButton
            label="Alby Support"
            primary
            className="font-serif text-base"
          />
        </div>
      </form>
      {error && (
        <p className="mt-3">
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
