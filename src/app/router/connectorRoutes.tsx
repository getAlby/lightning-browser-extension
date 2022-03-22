import ConnectLnd from "../screens/Onboard/ConnectLnd";
import ConnectLndHub from "../screens/Onboard/ConnectLndHub";
import ConnectLnbits from "../screens/Onboard/ConnectLnbits";
import ConnectGaloy, { galoyUrls } from "../screens/Onboard/ConnectGaloy";
import ConnectEclair from "../screens/Onboard/ConnectEclair";
import ConnectCitadel from "../screens/Onboard/ConnectCitadel";
import NewWallet from "../screens/Onboard/NewWallet";
import ConnectUmbrel from "../screens/Onboard/ConnectUmbrel";
import ConnectStart9 from "../screens/Onboard/ConnectStart9";
import ConnectMyNode from "../screens/Onboard/ConnectMyNode";

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
