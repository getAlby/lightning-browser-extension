function getOS() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Win") !== -1) return "Windows";
  if (userAgent.indexOf("Mac") !== -1) return "MacOS";
  if (userAgent.indexOf("X11") !== -1) return "UNIX";
  if (userAgent.indexOf("Linux") !== -1) return "Linux";
}

export default getOS;
