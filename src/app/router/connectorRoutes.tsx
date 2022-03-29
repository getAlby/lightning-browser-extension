import ConnectLnd from "../screens/connectors/ConnectLnd";
import ConnectLndHub from "../screens/connectors/ConnectLndHub";
import ConnectLnbits from "../screens/connectors/ConnectLnbits";
import ConnectGaloy, { galoyUrls } from "../screens/connectors/ConnectGaloy";
import ConnectEclair from "../screens/connectors/ConnectEclair";
import ConnectCitadel from "../screens/connectors/ConnectCitadel";
import NewWallet from "../screens/Onboard/NewWallet";
import ConnectUmbrel from "../screens/connectors/ConnectUmbrel";
import ConnectStart9 from "../screens/connectors/ConnectStart9";
import ConnectMyNode from "../screens/connectors/ConnectMyNode";

const galoyPaths: { [key: string]: keyof typeof galoyUrls } = {
  bitcoinBeach: "galoy-bitcoin-beach",
  bitcoinJungle: "galoy-bitcoin-jungle",
};

export default [
  { path: "lnd", element: <ConnectLnd /> },
  { path: "lnd-hub", element: <ConnectLndHub /> },
  { path: "lnbits", element: <ConnectLnbits /> },
  { path: "eclair", element: <ConnectEclair /> },
  { path: "citadel", element: <ConnectCitadel /> },
  { path: "create-wallet", element: <NewWallet /> },
  {
    path: galoyPaths.bitcoinBeach,
    element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
  },
  {
    path: galoyPaths.bitcoinJungle,
    element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
  },
  { path: "umbrel", element: <ConnectUmbrel /> },
  { path: "start9", element: <ConnectStart9 /> },
  { path: "mynode", element: <ConnectMyNode /> },
];
