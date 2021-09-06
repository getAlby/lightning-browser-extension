import { useState } from "react";
import { RadioGroup } from "@headlessui/react";

import { classNames } from "../../../utils/index";

export default function Radio({ options }) {
  const [selected, setSelected] = useState(options[0]);

  return (
    <RadioGroup value={selected} onChange={setSelected}>
      <RadioGroup.Label className="sr-only">Pricing plans</RadioGroup.Label>
      <div className="relative bg-white rounded-md -space-y-px">
        {options.map((option, optionIdx) => (
          <RadioGroup.Option
            key={optionIdx}
            value={option}
            className={({ checked }) =>
              classNames(
                optionIdx === 0 ? "rounded-tl-md rounded-tr-md" : "",
                optionIdx === options.length - 1
                  ? "rounded-bl-md rounded-br-md"
                  : "",
                checked ? "z-10" : "border-gray-200",
                "relative border p-4 flex flex-col cursor-pointer md:pl-4 md:pr-6 md:grid md:grid-cols-3 focus:outline-none"
              )
            }
          >
            {({ active, checked }) => (
              <>
                <div className="flex items-center text-sm">
                  <span
                    className={classNames(
                      checked
                        ? "bg-black border-transparent"
                        : "bg-white border-gray-300",
                      active ? "ring-2 ring-offset-2 ring-black" : "",
                      "h-4 w-4 rounded-full border flex items-center justify-center"
                    )}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                  <RadioGroup.Label
                    as="span"
                    className="ml-3 font-medium text-gray-900"
                  >
                    {option.speed}
                  </RadioGroup.Label>
                </div>
                <RadioGroup.Description className="ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-center">
                  <span
                    className={classNames(
                      checked ? "text-black" : "text-gray-900",
                      "font-medium"
                    )}
                  >
                    {option.time}
                  </span>
                </RadioGroup.Description>
                <RadioGroup.Description
                  className={classNames(
                    checked ? "text-black" : "text-gray-500",
                    "ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-right font-semibold"
                  )}
                >
                  {option.value}
                </RadioGroup.Description>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
