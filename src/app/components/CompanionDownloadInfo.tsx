import { ReceiveIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

function CompanionDownloadInfo() {
  function getOS() {
    if (navigator.appVersion.indexOf("Win") != -1) return "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) return "MacOS";
    if (navigator.appVersion.indexOf("X11") != -1) return "UNIX";
    if (navigator.appVersion.indexOf("Linux") != -1) return "Linux";
  }

  // TODO: check if the companion app is already installed
  return (
    <div className="mt-6">
      You are trying to connect to a node behind Tor. Because browsers cannot
      directly connect to your node please make sure you have the Alby companion
      app installed. You can download it from{" "}
      <a
        href={`https://getalby.com/install/companion/${getOS()}`}
        target="_blank"
        rel="noreferrer"
      >
        it here
        <ReceiveIcon className="w-6 h-6 inline" />
      </a>
    </div>
  );
}

export default CompanionDownloadInfo;
