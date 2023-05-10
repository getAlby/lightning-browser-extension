import { LightningAddress } from "alby-tools";
import { useState } from "react";
import "~/app/styles/index.css";
import WebLNProvider from "~/extension/providers/webln";

function BoostButton({ lnurl }) {
  const [webLNDisabled, setWebLNDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sats, setSats] = useState(0);
  const [sent, setSent] = useState(false);

  const [hold, setHold] = useState(false);
  const [timer, setTimer] = useState();
  const [holdTimer, setHoldTimer] = useState();

  const [expand, setExpand] = useState(false);
  const [satsClicked, setSatsClicked] = useState(0);

  const sendSatsToLnurl = async () => {
    setLoading(true);
    try {
      if (!window.webln) {
        window.webln = new WebLNProvider();
      }
      await window.webln.enable();
      const result = await window.webln.lnurl(lnurl);
      if (result) {
        setSats(result.route.total_amt);
        setSent(true);
      }
    } catch (e) {
      if (e.message !== "Prompt was closed" && e.message !== "User rejected")
        setWebLNDisabled(true);
      console.error(e.message);
    } finally {
      setLoading(false);
      setHold(false);
    }
  };

  const generateInvoice = async (satsClicked) => {
    setLoading(true);
    if (!satsClicked) return;
    const ln = new LightningAddress(lnurl);
    const invoice = await ln.generateInvoice({
      amount: (satsClicked * 1000).toString(),
    });
    if (!window.webln) {
      window.webln = new WebLNProvider();
    }
    try {
      await window.webln.enable();
      const result = await window.webln.sendPayment(invoice.paymentRequest);
      if (result) {
        setSats(result.route.total_amt);
        setSent(true);
      }
    } catch (e) {
      setSatsClicked(0);
      if (e.message !== "Prompt was closed" && e.message !== "User rejected")
        setWebLNDisabled(true);
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const textStyle = {
    fontFamily: "Inter",
    fontSize: "16px",
    color: "#000000",
    transition:
      "opacity 0.25s ease-out, width 0.25s ease-out, max-width 0.25s ease-out",
    whiteSpace: "nowrap",
    opacity: expand ? 1 : 0,
    padding: expand ? "0 15px 0 5px" : "0",
    overflow: "hidden",
    width: expand ? (!sent ? "80px" : "120px") : "0",
    maxWidth: expand ? (!sent ? "80px" : "120px") : "0",
  };

  const timesClicked = satsClicked / 1000;

  return (
    <button
      className={`${
        !webLNDisabled && !satsClicked && !sent
          ? "ripple-shadow"
          : "normal-shadow"
      } ${!webLNDisabled ? "boost" : "disabled-boost"}`}
      onClick={() => {
        if (loading || webLNDisabled || sent || hold) return;
        if (timer) clearTimeout(timer);
        if (holdTimer) clearTimeout(holdTimer);
        setTimer(
          setTimeout(() => {
            generateInvoice(satsClicked + 1000);
          }, 1000)
        );
        setSatsClicked(satsClicked + 1000);
      }}
      onMouseDown={() => {
        if (loading || webLNDisabled || sent || hold || loading) return;
        setHoldTimer(
          setTimeout(() => {
            setHold(true);
            setSatsClicked(0);
            sendSatsToLnurl();
          }, 2000)
        );
      }}
      onMouseEnter={() => setExpand(true)}
      onMouseLeave={() => setExpand(false)}
    >
      <style>
        {`
        button {
          position: fixed;
          z-index: 1000000000;
          bottom: 20px;
          right: 20px;
          border: none;
          background-color: #FFDE6E;
          border-radius: 24px;
          padding: 4px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        button:after { 
          content: "${
            webLNDisabled
              ? "Enable WebLN and refresh"
              : "Long press for custom boost"
          }";
          white-space: nowrap;
          font-family: Inter;
          position: absolute;
          top: -25px;
          left: calc(50% - 63px);
          width: 110px;
          font-size: 8px;
          padding: 4px 8px;
          border-radius: 12px;
          background-color: #404040;
          color: white;
          opacity: ${!satsClicked && expand && !sent && !hold ? 1 : 0};
          transition: opacity 0.5s ease-out;
        }
        button div {
          fontFamily: Inter;
          fontSize: 16px;
          color: #000000;
          transition: opacity 0.25s ease-out, width 0.25s ease-out, max-width 0.25s ease-out;
          whiteSpace: nowrap;
          opacity: ${expand ? 1 : 0};
          padding: ${expand ? "0 15px 0 5px" : "0"};
          overflow: hidden;
          width: ${expand ? (!sent ? "80px" : "120px") : "0"};
          maxWidth: ${expand ? (!sent ? "80px" : "120px") : "0"};
        }
        .disabled-boost #lightning {
          opacity: 0.5;
        }

        .shake {
          animation: shake 2s;
          animation-iteration-count: infinite;
        }
        @keyframes shake {
          0% { transform: rotate(0deg); }
          2.5% { transform: rotate(-5deg); }
          5% { transform: rotate(-10deg); }
          10% { transform: rotate(0deg); }
          15% { transform: rotate(10deg); }
          17.5% { transform: rotate(5deg); }
          20%, 100% { transform:rotate(0deg); }
        }
        .ripple-shadow {
          animation: ripple 2s;
          animation-iteration-count: infinite;
        }
        .normal-shadow {
          box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.2);
        }
        @keyframes ripple {
          0% {
            box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04),
                        0 0 0 8px rgba(0, 0, 0, 0.04),
                        0 0 0 12px rgba(0, 0, 0, 0.04),
                        0 0 0 16px rgba(0, 0, 0, 0.04),
                        0 0 10px 5px rgba(0, 0, 0, 0.2);
          }
          100% {
            box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.04),
                        0 0 0 12px rgba(0, 0, 0, 0.04),
                        0 0 0 16px rgba(0, 0, 0, 0.04),
                        0 0 0 20px rgba(0, 0, 0, 0),
                        0 0 10px 5px rgba(0, 0, 0, 0.2);
          }
        }
        .boost:active #lightning {
          animation: ${!sent ? "pop 0.5s" : ""};
          animation-iteration-count: infinite;
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        #loading {
          width: 36px;
          padding: 2px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }`}
      </style>
      {loading ? (
        <svg
          id="loading"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="#000000"
            strokeWidth="4"
          ></circle>
          <path
            fill="#ffffff"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          id="lightning"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="black"
          width="40px"
          className={`${
            !webLNDisabled && !satsClicked && !sent ? "shake" : ""
          }`}
        >
          <defs>
            <linearGradient
              x1="50%"
              x2="50%"
              y1="0%"
              y2="100%"
              id="left-to-right"
            >
              <stop
                offset={satsClicked ? 1 - (timesClicked % 5) / 4 : 1}
                stopColor="#fff"
              />
              <stop
                offset={satsClicked ? 1 - (timesClicked % 5) / 4 : 1}
                stopColor="#ff9900"
              />
            </linearGradient>
          </defs>
          <path
            fill="url(#left-to-right)"
            d="M18.496 10.709l-8.636 8.88c-.24.246-.638-.039-.482-.345l3.074-6.066a.3.3 0 00-.268-.436H5.718a.3.3 0 01-.214-.51l8.01-8.115c.232-.235.618.023.489.328L11.706 9.86a.3.3 0 00.28.417l6.291-.078a.3.3 0 01.22.509z"
          />
        </svg>
      )}
      <div style={textStyle}>
        {!webLNDisabled
          ? !sent
            ? satsClicked
              ? `${satsClicked} sats`
              : `Boost`
            : `${sats} sats sent`
          : `No WebLN`}
      </div>
    </button>
  );
}

export default BoostButton;
