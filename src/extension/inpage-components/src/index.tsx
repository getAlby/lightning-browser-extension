import './index.css';
import BoostButton from './BoostButton';
import reportWebVitals from './reportWebVitals';
import ReactDOM from 'react-dom/client';
import AlbyProvider from '../../content-script/providers/alby';

declare global {
  interface Window {
    alby: AlbyProvider;
  }
}

class BoostButtonHTMLElement extends HTMLElement {
  connectedCallback() {
    const root = ReactDOM.createRoot(this);

    //this.attachShadow({ mode: 'open' })
    const lnurl = this.getAttribute('lnurl');
    if(!lnurl) {
      throw new Error("LNURL missing.")
    }
    root.render(<BoostButton lnurl={lnurl}/>);
  }
}

customElements.define('boost-button', BoostButtonHTMLElement);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
