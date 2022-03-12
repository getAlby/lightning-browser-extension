import ConnectLnd from "../screens/Onboard/ConnectLnd";
import ConnectLndConnect from "../screens/Onboard/ConnectLndConnect";
import ConnectLndHub from "../screens/Onboard/ConnectLndHub";
import ConnectLnbits from "../screens/Onboard/ConnectLnbits";
import ConnectEclair from "../screens/Onboard/ConnectEclair";
import ConnectUmbrel from "../screens/Onboard/ConnectUmbrel";
import ConnectCitadel from "../screens/Onboard/ConnectCitadel";
import NewWallet from "../screens/Onboard/NewWallet";

export default [
  { path: "lnd", element: <ConnectLnd /> },
  { path: "lndconnect", element: <ConnectLndConnect /> },
  { path: "lnd-hub", element: <ConnectLndHub /> },
  { path: "lnbits", element: <ConnectLnbits /> },
  { path: "eclair", element: <ConnectEclair /> },
  { path: "citadel", element: <ConnectCitadel /> },
  { path: "create-wallet", element: <NewWallet /> },
  { path: "umbrel", element: <ConnectUmbrel /> },
];
