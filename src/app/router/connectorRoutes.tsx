import ConnectLnd from "../screens/Onboard/ConnectLnd";
import ConnectLndHub from "../screens/Onboard/ConnectLndHub";
import ConnectLnbits from "../screens/Onboard/ConnectLnbits";
import ConnectGaloy from "../screens/Onboard/ConnectGaloy";
import NewWallet from "../screens/Onboard/NewWallet";

export default [
  { path: "lnd", element: <ConnectLnd /> },
  { path: "lnd-hub", element: <ConnectLndHub /> },
  { path: "lnbits", element: <ConnectLnbits /> },
  { path: "galoy", element: <ConnectGaloy /> },
  { path: "create-wallet", element: <NewWallet /> },
];
