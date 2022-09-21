import AlbyProvider from "./../content-script/providers/alby";

declare global {
  interface Window {
    alby: AlbyProvider;
  }
}

if (document) {
  window.alby = new AlbyProvider();
}
