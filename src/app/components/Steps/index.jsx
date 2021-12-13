import { Link } from "react-router-dom";

export default function Steps({ steps }) {
  function createStep(step) {
    let outerStyles = "";
    let innerStyles = "";
    switch (step.status) {
      case "complete":
        outerStyles =
          "group pl-4 py-2 flex flex-col border-l-4 border-orange-bitcoin md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4";
        innerStyles = "text-xs text-black font-500 tracking-wide uppercase";
        break;
      case "current":
        outerStyles =
          "pl-4 py-2 flex flex-col border-l-4 border-orange-bitcoin md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4";
        innerStyles = "text-xs text-black font-bold tracking-wide uppercase";
        break;
      default:
        outerStyles =
          "group pl-4 py-2 flex flex-col border-l-4 border-gray-200 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4";
        innerStyles =
          "text-xs text-gray-500 font-normal tracking-wide uppercase";
        if (step.href) {
          outerStyles += " hover:border-gray-300";
          innerStyles += " group-hover:text-gray-700";
        }
        break;
    }
    if (step.href) {
      return (
        <Link
          to={step.href}
          className={outerStyles}
          aria-current={step.status === "current" ? "step" : ""}
        >
          <span className={innerStyles}>{step.id}</span>
        </Link>
      );
    }
    return (
      <div className={outerStyles}>
        <span className={innerStyles}>{step.id}</span>
      </div>
    );
  }

  return (
    <nav className="mt-5" aria-label="Progress">
      <ol className="md:flex md:space-y-0 md:space-x-8">
        {steps.map((step) => (
          <li key={step.id} className="md:flex-1">
            {createStep(step)}
          </li>
        ))}
      </ol>
    </nav>
  );
}
