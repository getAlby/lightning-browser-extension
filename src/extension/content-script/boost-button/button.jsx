import { LightningAddress } from "alby-tools";
import { useCallback, useEffect, useState } from "react";
import "~/app/styles/index.css";
import WebLNProvider from "~/extension/ln/webln";

import extractLightningData from "../batteries/index";

function BoostButton() {
  const [lnurl, setLnurl] = useState(false);

  const [sats, setSats] = useState(0);
  const [sent, setSent] = useState(false);

  const [hold, setHold] = useState(false);
  const [timer, setTimer] = useState();
  const [holdTimer, setHoldTimer] = useState();

  const [expand, setExpand] = useState(false);
  const [satsClicked, setSatsClicked] = useState(0);

  useEffect(() => {
    let count = 0;

    const extract = async () => {
      count++;
      const lnData = await extractLightningData();
      if (lnData) {
        setLnurl(lnData.address);
        clearInterval(intervalId);
      } else if (count >= 5) {
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(extract, 3000);
    extract();
  }, []);

  const sendSatsToLnurl = useCallback(async () => {
    window.webln = new WebLNProvider();
    try {
      await window.webln.enable();
      const result = await window.webln.lnurl(lnurl);
      if (result) {
        setSats(result.route.total_amt);
        setSent(true);
      }
    } catch (e) {
      console.info("failed payment either enable or lnurl");
      console.error(e);
    } finally {
      setHold(false);
    }
  }, [lnurl]);

  const generateInvoice = useCallback(
    async (satsClicked) => {
      if (!satsClicked) return;
      const ln = new LightningAddress(lnurl);
      const invoice = await ln.generateInvoice({
        amount: (satsClicked * 1000).toString(),
      });
      window.webln = new WebLNProvider();
      try {
        await window.webln.enable();
        const result = await window.webln.sendPayment(invoice.paymentRequest);
        if (result) {
          setSats(result.route.total_amt);
          setSent(true);
        }
      } catch (e) {
        setSatsClicked(0);
        console.error(e);
      }
    },
    [lnurl]
  );

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

  return lnurl ? (
    <button
      className={!satsClicked && !sent ? "ripple-shadow" : "normal-shadow"}
      onClick={() => {
        if (sent || hold) return;
        if (timer) clearTimeout(timer);
        if (holdTimer) clearTimeout(holdTimer);
        setTimer(
          setTimeout(() => {
            generateInvoice(satsClicked + 1000);
          }, 2000)
        );
        setSatsClicked(satsClicked + 1000);
      }}
      onMouseDown={() => {
        if (sent || hold) return;
        setHoldTimer(
          setTimeout(() => {
            setHold(true);
            setExpand(true);
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
          content: "Long press for custom boost";
          white-space: nowrap;
          font-family: Inter;
          position: absolute;
          top: -50%;
          right: 8%;
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
        button:active svg {
          animation: ${!sent ? "pop 0.5s" : ""};
          animation-iteration-count: infinite;
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }`}
      </style>
      <svg
        id="lightning"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="black"
        width="40px"
        className={`${!satsClicked && !sent ? "shake" : ""}`}
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
      <div style={textStyle}>
        {!sent
          ? satsClicked
            ? `${satsClicked} sats`
            : `Boost`
          : `${sats} sats sent`}
      </div>
    </button>
  ) : null;
}

export default BoostButton;
