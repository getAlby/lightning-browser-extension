import React, { useState, useEffect, useRef } from "react";
import { createHashHistory } from "history";

import Button from "../../components/button";
import PublisherCard from "../../components/PublisherCard";
import msg from "../../../common/lib/msg";

function Enable(props) {
  const [loading, setLoading] = useState(true);
  const [remember, setRemember] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [budget, setBudget] = useState(null);
  const history = useRef(createHashHistory());

  function enable() {
    setEnabled(true);
    msg.reply({
      enabled: true,
      remember,
      budget,
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
          host: props.origin.host,
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

      <div className="text-center p-6">
        <h3 className="text-xl mb-4">
          Connect with <i>host.com</i>
        </h3>

        <p className="text-base text-gray-500 mb-4">
          <strong>The Hype Machine (hypem.com)</strong> does not have access to
          your account.
        </p>
        <p className="text-base text-gray-500 mb-4">
          Do you want to grant them access?
        </p>

        <div className="mt-8 mb-5">
          <Button type="primary" label="Enable" fullWidth onClick={enable} />
        </div>

        <p className="mb-3 underline text-sm text-gray-300">
          Only connect with sites you trust.
        </p>

        <a
          className="underline text-sm text-gray-500"
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
