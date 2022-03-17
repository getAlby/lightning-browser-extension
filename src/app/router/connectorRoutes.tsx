import ConnectLnd from "../screens/Onboard/ConnectLnd";
import ConnectLndHub from "../screens/Onboard/ConnectLndHub";
import ConnectLnbits from "../screens/Onboard/ConnectLnbits";
import ConnectEclair from "../screens/Onboard/ConnectEclair";
import ConnectCitadel from "../screens/Onboard/ConnectCitadel";
import NewWallet from "../screens/Onboard/NewWallet";
import ConnectUmbrel from "../screens/Onboard/ConnectUmbrel";
import ConnectStart9 from "../screens/Onboard/ConnectStart9";
import ConnectMyNode from "../screens/Onboard/ConnectMyNode";

export default [
  { path: "lnd", element: <ConnectLnd /> },
  { path: "lnd-hub", element: <ConnectLndHub /> },
  { path: "lnbits", element: <ConnectLnbits /> },
  { path: "eclair", element: <ConnectEclair /> },
  { path: "citadel", element: <ConnectCitadel /> },
  { path: "create-wallet", element: <NewWallet /> },
  { path: "umbrel", element: <ConnectUmbrel /> },
  { path: "start9", element: <ConnectStart9 /> },
  { path: "mynode", element: <ConnectMyNode /> },
];
