import { MouseEvent } from "react";

import msg from "../../common/lib/msg";

import Button from "../components/Button";
import PublisherCard from "../components/PublisherCard";

type Props = {
  details: {
    domain: string;
    k1: string;
  };
  origin: {
    name: string;
    icon: string;
  };
};

function LNURLAuth({ details, origin }: Props) {
  async function confirm() {
    return await msg.reply({
      confirmed: true,
      remember: true,
    });
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    msg.error("User rejected");
  }

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />
      <div className="p-6">
        <dl className="shadow bg-white dark:bg-gray-700 p-4 rounded-lg mb-8">
          <dt className="font-semibold text-gray-500">
            {origin.name} asks you to login to
          </dt>
          <dd className="mb-6 dark:text-white">{details.domain}</dd>
        </dl>
        <div className="text-center">
          <div className="mb-5">
            <Button onClick={confirm} label="Login" fullWidth primary />
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
    </div>
  );
}

export default LNURLAuth;
