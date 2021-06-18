import React from "react";
import { Link } from "react-router-dom";

export default function Steps(props) {
  return (
    <nav className="mt-5" aria-label="Progress">
      <ol className="md:flex md:space-y-0 md:space-x-8">
        {props.steps.map((step) => (
          <li key={step.id} className="md:flex-1">
            {step.status === "complete" ? (
              <Link
                to={step.href}
                className="group pl-4 py-2 flex flex-col border-l-4 border-orange-bitcoin hover:border-hover-orange-bitcoin md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
              >
                <span className="text-xs text-orange-bitcoin font-semibold tracking-wide uppercase group-hover:text-hover-orange-bitcoin">
                  {step.id}
                </span>
              </Link>
            ) : step.status === "current" ? (
              <Link
                to={step.href}
                className="pl-4 py-2 flex flex-col border-l-4 border-orange-bitcoin md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                aria-current="step"
              >
                <span className="text-xs text-orange-bitcoin font-semibold tracking-wide uppercase">
                  {step.id}
                </span>
              </Link>
            ) : (
              <Link
                to={step.href}
                className="group pl-4 py-2 flex flex-col border-l-4 border-gray-200 hover:border-gray-300 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
              >
                <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase group-hover:text-gray-700">
                  {step.id}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
