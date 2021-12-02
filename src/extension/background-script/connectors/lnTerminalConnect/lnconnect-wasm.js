require('./wasm_exec');
import browser from "webextension-polyfill";
import bridge from './bridge.js';

// TODO: rename wasm file / build with webpack
const filename = browser.runtime.getURL('assets/wasm-client.wasm');
const wasm = fetch(filename).then(response => response.arrayBuffer());
export default bridge(wasm);
