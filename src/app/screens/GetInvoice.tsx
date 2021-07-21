import React, { useState, useEffect } from "react";
const { bech32 } = require("bech32");

type Props = {
  lnurlEncoded: string;
};

function GetInvoice({ lnurlEncoded }: Props) {
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

  return <div>lnurl: {lnurl}</div>;
}

export default GetInvoice;
