import React, { useState, useEffect, useRef } from "react";
import { createHashHistory } from "history";

import Button from "../../components/button";
import PublisherCard from "../../components/PublisherCard";
import msg from "../../../common/lib/msg";

function Enable(props) {
  const [loading, setLoading] = useState(true);
  const [remember, setRemember] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [budget, setBudget] = useState(null);
  const history = useRef(createHashHistory());

  function enable() {
    setEnabled(true);
    msg.reply({
      enabled: true,
      remember,
      budget,
      spent: 0,
    });
  }

  function reject(event) {
    msg.error("User rejected");
    event.preventDefault();
  }

  useEffect(() => {
    async function getAllowance() {
      try {
        const allowance = await msg.request("getAllowance", {
          domain: props.origin.domain,
        });
        if (allowance && allowance.enabled) {
          enable();
        }
        setLoading(false);
      } catch (e) {
        console.log(e.message);
      }
    }
    getAllowance();
  }, []);

  return (
    <div>
      <PublisherCard
        title="The Biz with John Carvalho"
        image="https://img.podplay.com/922c5e7d-0230-51d4-a81c-578eb3d7c616/575/575"
      />

      <div className="text-center px-8 py-16">
        {/* <strong>{JSON.stringify(props.origin)}</strong> */}
        <h3 className="text-2xl mb-6">
          Connect with <i>host.com</i>
        </h3>

        <p className="text-xl text-gray-500 mb-6">
          <strong>The Hype Machine (hypem.com)</strong> does not have access to
          your account.
        </p>
        <p className="text-xl text-gray-500 mb-6">
          Do you want to grant them access?
        </p>

        <div className="mb-6">
          <p className="mb-6">
            Remember:{" "}
            <input
              name="remember"
              type="checkbox"
              onChange={(event) => {
                setRemember(event.target.checked);
              }}
            />
          </p>

          <p>
            Budget:{" "}
            <input
              type="text"
              name="budget"
              onChange={(event) => {
                setBudget(event.target.value);
              }}
            />
          </p>
        </div>

        <Button type="primary" label="Enable" fullWidth onClick={enable} />

        <p className="mt-6 underline text-base text-gray-300">
          Only connect with sites you trust.
        </p>

        <a
          className="mt-6 underline text-base text-gray-500"
          href="#"
          onClick={reject}
        >
          Cancel
        </a>
      </div>
    </div>
  );
}

export default Enable;
