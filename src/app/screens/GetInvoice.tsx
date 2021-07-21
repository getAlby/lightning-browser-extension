import React, { useState, useEffect } from "react";
import PublisherCard from "../components/PublisherCard";
const { bech32 } = require("bech32");

type Props = {
  lnurlEncoded: string;
  origin: {
    name: string;
    icon: string;
  };
};

function GetInvoice({ lnurlEncoded, origin }: Props) {
  const [lnurl, setLnurl] = useState("");

  useEffect(() => {
    try {
      const { words: dataPart } = bech32.decode(lnurlEncoded, 2000);
      const requestByteArray = bech32.fromWords(dataPart);
      setLnurl(Buffer.from(requestByteArray).toString());
    } catch (e) {
      console.log(e.message);
    }
  }, [lnurlEncoded]);

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />
      lnurl: {lnurl}
    </div>
  );
}

export default GetInvoice;
