import React from "react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Disclosure } from "@headlessui/react";
import { classNames } from "../../../utils/index";
export default function FAQs(props) {
  return (
    <dl className="mt-6 space-y-6 divide-y divide-gray-200">
      {props.faqs.map((faq) => (
        <Disclosure as="div" key={faq.question} className="pt-6">
          {({ open }) => (
            <>
              <dt className="text-lg">
                <Disclosure.Button className="text-left w-full flex justify-between items-start text-gray-400">
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <span className="ml-6 h-7 flex items-center">
                    <ChevronDownIcon
                      className={classNames(
                        open ? "-rotate-180" : "rotate-0",
                        "h-6 w-6 transform"
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </Disclosure.Button>
              </dt>
              <Disclosure.Panel as="dd" className="mt-2 pr-12">
                <p className="text-base text-gray-500">{faq.answer}</p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </dl>
  );
}
