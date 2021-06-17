import React from "react";
import FAQs from "./faqs";
import Features from "./features";
import {
  GlobeAltIcon,
  LightningBoltIcon,
  MailIcon,
  ArrowRightIcon,
  ScaleIcon,
} from "@heroicons/react/outline";
import { useHistory } from "react-router-dom";

const features = [
  {
    name: "Competitive rates",
    description:
      "Consequuntur omnis dicta cumque, inventore atque ab dolores aspernatur tempora ab doloremque.",
    icon: GlobeAltIcon,
  },
  {
    name: "No hidden fees",
    description:
      "Corporis quisquam nostrum nulla veniam recusandae temporibus aperiam officia incidunt at distinctio ratione.",
    icon: ScaleIcon,
  },
  {
    name: "Instant transfers",
    description:
      "Omnis, illo delectus? Libero, possimus nulla nemo tenetur adipisci repellat dolore eligendi velit doloribus mollitia.",
    icon: LightningBoltIcon,
  },
  {
    name: "Reminder emails",
    description:
      "Veniam necessitatibus reiciendis fugit explicabo dolorem nihil et omnis assumenda odit? Quisquam unde accusantium.",
    icon: MailIcon,
  },
];

const faqs = [
  {
    id: 1,
    question: "What's the lightning network?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 2,
    question: "What a lightning network transaction cost?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 3,
    question: "What are other applications of the ln?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
];

export default function Intro() {
  const history = useHistory();

  return (
    <div>
      <div className="relative lg:grid lg:grid-cols-3 lg:gap-x-8 mt-20">
        <div className="lg:col-span-1 ml-12 mt-8">
          <img src="https://i.ibb.co/3F3mCkR/logox.png" />
          <h2 className="mt-10 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to send money.
          </h2>
        </div>
        <Features features={features} />
      </div>
      <div className="sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200 mr-0">
          <FAQs faqs={faqs} />
        </div>
      </div>
      <button
        onClick={() => history.push("/set-password")}
        type="button"
        className="mr-5 float-right inline-flex items-center p-3 border border-transparent rounded-full shadow-sm text-white bg-orange-bitcoin hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <ArrowRightIcon className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
