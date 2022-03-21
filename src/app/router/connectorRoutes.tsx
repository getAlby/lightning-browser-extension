import ConnectLnd from "../screens/Onboard/ConnectLnd";
import ConnectLndHub from "../screens/Onboard/ConnectLndHub";
import ConnectLnbits from "../screens/Onboard/ConnectLnbits";
import ConnectGaloy, { galoyUrls } from "../screens/Onboard/ConnectGaloy";
import ConnectEclair from "../screens/Onboard/ConnectEclair";
import NewWallet from "../screens/Onboard/NewWallet";

const galoyPaths: { [key: string]: keyof typeof galoyUrls } = {
  bitcoinBeach: "galoy-bitcoin-beach",
  bitcoinJungle: "galoy-bitcoin-jungle",
};

export default [
  { path: "lnd", element: <ConnectLnd /> },
  { path: "lnd-hub", element: <ConnectLndHub /> },
  { path: "lnbits", element: <ConnectLnbits /> },
  { path: "eclair", element: <ConnectEclair /> },
  { path: "create-wallet", element: <NewWallet /> },
  {
    path: galoyPaths.bitcoinBeach,
    element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
  },
  {
    path: galoyPaths.bitcoinJungle,
    element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
  },
];
