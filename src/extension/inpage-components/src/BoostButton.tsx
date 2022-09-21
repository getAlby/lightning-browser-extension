import React from 'react';
import './BoostButton.css';
import Particles from "react-particles";
import type { Engine } from "tsparticles-engine";
import { loadConfettiPreset } from "tsparticles-preset-confetti";
export default class BoostButton extends React.Component<BoostButtonProps, BoostButtonState> {

  buttonEl: React.RefObject<HTMLDivElement>;
  spanEl: React.RefObject<HTMLDivElement>;

  state: BoostButtonState = {
    text: "21",
    loading: false
  }

  constructor(props: BoostButtonProps) {
    super(props);

    this.buttonEl = React.createRef();
    this.spanEl = React.createRef();
  }

  mouseEnter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!this.spanEl.current || !this.buttonEl.current) return;

    calculateAngle(e, this.spanEl.current, this.buttonEl.current);
  }

  mouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!this.spanEl.current || !this.buttonEl.current) return;

    calculateAngle(e, this.spanEl.current, this.buttonEl.current);
  }

  mouseLeave(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {

    if (!this.spanEl.current || !this.buttonEl.current) return;

    let dropShadowColor = `rgba(0, 0, 0, 0.3)`
    const attribute = this.buttonEl.current.getAttribute('data-filter-color');
    if (attribute) {
      dropShadowColor = attribute;
    }
    this.spanEl.current.style.transform = `rotateY(0deg) rotateX(0deg) scale(1)`;
    this.spanEl.current.style.filter = `drop-shadow(0 10px 15px ${dropShadowColor})`;

  }

  async click(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    this.setState({ loading: true });

    try {
      var result = await window.alby.lnurl(this.props.lnurl, 21, "🚀") as any;
      await window.webln.enable();
      var test = await window.webln.sendPayment(result.pr);
      console.log(test);
    }
    catch(e) {
      console.error(e);
    }
    
    this.setState({ text: (parseInt(this.state.text) + 1).toString(), loading: false });
  }

  render() {
    return <div className="BoostButton" onClick={(e) => this.click(e)} ref={this.buttonEl} onMouseEnter={(e) => this.mouseEnter(e)} onMouseMove={(e) => this.mouseMove(e)} onMouseLeave={(e) => this.mouseLeave(e)}>   
            <div ref={this.spanEl}>
              {this.state.loading && <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
              width="40px" height="40px" viewBox="0 0 40 40">
              <path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
                s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
                c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>
              <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
                C22.32,8.481,24.301,9.057,26.013,10.047z">
                <animateTransform attributeType="xml"
                  attributeName="transform"
                  type="rotate"
                  from="0 20 20"
                  to="360 20 20"
                  dur="0.5s"
                  repeatCount="indefinite"/>
                </path>
              </svg>}
              {!this.state.loading && 
                
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle r="4.1939" transform="matrix(-1 0 0 1 10.7644 15.797)" fill="#C5C7C8"/>
                  <circle r="4.1939" transform="matrix(-1 0 0 1 10.7644 15.797)" fill="black" fill-opacity="0.8"/>
                  <path d="M10.0654 15.1679L17.894 22.9966" stroke="#C5C7C8" stroke-width="2.09695"/>
                  <path d="M10.0654 15.1679L17.894 22.9966" stroke="black" stroke-opacity="0.8" stroke-width="2.09695"/>
                  <circle cx="45.0145" cy="15.797" r="4.1939" fill="#C5C7C8"/>
                  <circle cx="45.0145" cy="15.797" r="4.1939" fill="black" fill-opacity="0.8"/>
                  <path d="M45.7834 15.1679L37.9548 22.9966" stroke="#C5C7C8" stroke-width="2.09695"/>
                  <path d="M45.7834 15.1679L37.9548 22.9966" stroke="black" stroke-opacity="0.8" stroke-width="2.09695"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9548 40.8233C9.69439 39.7472 8.37888 37.3307 8.81954 34.8664C10.7109 24.2893 18.593 16.3562 28.0292 16.3562C37.4884 16.3562 45.3858 24.3278 47.2525 34.9433C47.6867 37.4121 46.3605 39.8274 44.0924 40.8948C39.2391 43.1787 33.8182 44.4554 28.0991 44.4554C22.3206 44.4554 16.8465 43.152 11.9548 40.8233Z" fill="#FFDF6F"/>
                  <path d="M47.2525 34.9433L46.2199 35.1249L47.2525 34.9433ZM9.85165 35.0509C11.6792 24.8306 19.2335 17.4047 28.0292 17.4047V15.3077C17.9524 15.3077 9.74257 23.748 7.78744 34.6818L9.85165 35.0509ZM28.0292 17.4047C36.8461 17.4047 44.416 24.8669 46.2199 35.1249L48.2852 34.7617C46.3555 23.7887 38.1306 15.3077 28.0292 15.3077V17.4047ZM43.646 39.9461C38.9294 42.1657 33.6607 43.4069 28.0991 43.4069V45.5038C33.9757 45.5038 39.5488 44.1917 44.5388 41.8435L43.646 39.9461ZM28.0991 43.4069C22.4798 43.4069 17.1594 42.1397 12.4054 39.8766L11.5041 41.7699C16.5336 44.1643 22.1614 45.5038 28.0991 45.5038V43.4069ZM46.2199 35.1249C46.568 37.1042 45.5082 39.0698 43.646 39.9461L44.5388 41.8435C47.2128 40.5851 48.8054 37.72 48.2852 34.7617L46.2199 35.1249ZM7.78744 34.6818C7.2594 37.6348 8.83929 40.5013 11.5041 41.7699L12.4054 39.8766C10.5495 38.9931 9.49836 37.0266 9.85165 35.0509L7.78744 34.6818Z" fill="#C5C7C8"/>
                  <path d="M47.2525 34.9433L46.2199 35.1249L47.2525 34.9433ZM9.85165 35.0509C11.6792 24.8306 19.2335 17.4047 28.0292 17.4047V15.3077C17.9524 15.3077 9.74257 23.748 7.78744 34.6818L9.85165 35.0509ZM28.0292 17.4047C36.8461 17.4047 44.416 24.8669 46.2199 35.1249L48.2852 34.7617C46.3555 23.7887 38.1306 15.3077 28.0292 15.3077V17.4047ZM43.646 39.9461C38.9294 42.1657 33.6607 43.4069 28.0991 43.4069V45.5038C33.9757 45.5038 39.5488 44.1917 44.5388 41.8435L43.646 39.9461ZM28.0991 43.4069C22.4798 43.4069 17.1594 42.1397 12.4054 39.8766L11.5041 41.7699C16.5336 44.1643 22.1614 45.5038 28.0991 45.5038V43.4069ZM46.2199 35.1249C46.568 37.1042 45.5082 39.0698 43.646 39.9461L44.5388 41.8435C47.2128 40.5851 48.8054 37.72 48.2852 34.7617L46.2199 35.1249ZM7.78744 34.6818C7.2594 37.6348 8.83929 40.5013 11.5041 41.7699L12.4054 39.8766C10.5495 38.9931 9.49836 37.0266 9.85165 35.0509L7.78744 34.6818Z" fill="black" fill-opacity="0.8"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9878 38.1937C14.1683 37.4527 13.089 35.5168 13.7195 33.6561C15.6638 27.9179 21.3354 23.7654 28.0292 23.7654C34.723 23.7654 40.3947 27.9179 42.339 33.6561C42.9694 35.5168 41.8901 37.4527 40.0707 38.1937C36.3545 39.7071 32.2893 40.5411 28.0292 40.5411C23.7692 40.5411 19.704 39.7071 15.9878 38.1937Z" fill="#C5C7C8"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9878 38.1937C14.1683 37.4527 13.089 35.5168 13.7195 33.6561C15.6638 27.9179 21.3354 23.7654 28.0292 23.7654C34.723 23.7654 40.3947 27.9179 42.339 33.6561C42.9694 35.5168 41.8901 37.4527 40.0707 38.1937C36.3545 39.7071 32.2893 40.5411 28.0292 40.5411C23.7692 40.5411 19.704 39.7071 15.9878 38.1937Z" fill="black" fill-opacity="0.8"/>
                  <ellipse cx="32.8522" cy="32.7124" rx="3.49492" ry="2.79593" fill="#C5C7C8"/>
                  <ellipse cx="32.8522" cy="32.7124" rx="3.49492" ry="2.79593" fill="white" fill-opacity="0.97"/>
                  <ellipse cx="22.8472" cy="32.7141" rx="3.49492" ry="2.79593" fill="#C5C7C8"/>
                  <ellipse cx="22.8472" cy="32.7141" rx="3.49492" ry="2.79593" fill="white" fill-opacity="0.97"/>
                </svg>

              }
            </div>
           </div>;
  }
}


let calculateAngle = function (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: HTMLElement, parent: HTMLElement) {
  let dropShadowColor = `rgba(0, 0, 0, 0.3)`
  const attribute = parent.getAttribute('data-filter-color');
  if (attribute) {
    dropShadowColor = attribute;
  }

  // Get the x position of the users mouse, relative to the button itself
  let x = Math.abs(item.getBoundingClientRect().x - e.clientX);
  // Get the y position relative to the button
  let y = Math.abs(item.getBoundingClientRect().y - e.clientY);

  // Calculate half the width and height
  let halfWidth = item.getBoundingClientRect().width / 2;
  let halfHeight = item.getBoundingClientRect().height / 2;

  // Use this to create an angle. I have divided by 6 and 4 respectively so the effect looks good.
  // Changing these numbers will change the depth of the effect.
  let calcAngleX = (x - halfWidth) / 6;
  let calcAngleY = (y - halfHeight) / 4;

  // Set the items transform CSS property
  item.style.transform = `rotateY(${calcAngleX}deg) rotateX(${calcAngleY}deg) scale(1.15)`;

  // And set its container's perspective.
  parent.style.perspective = `${halfWidth * 2}px`
  item.style.perspective = `${halfWidth * 3}px`

  if (parent.getAttribute('data-custom-perspective') !== null) {
    parent.style.perspective = `${parent.getAttribute('data-custom-perspective')}`
  }

  // Reapply this to the shadow, with different dividers
  let calcShadowX = (x - halfWidth) / 3;
  let calcShadowY = (y - halfHeight) / 3;

  // Add a filter shadow - this is more performant to animate than a regular box shadow.
  item.style.filter = `drop-shadow(${-calcShadowX}px ${calcShadowY}px 15px ${dropShadowColor})`;
}
class BoostButtonProps {
  lnurl!: string;
}

class BoostButtonState {
  text: string = "Boost";
  loading: boolean = false;
}

export class ParticlesContainer extends React.PureComponent<{}> {
  // this customizes the component tsParticles installation
  async customInit(engine: Engine): Promise<void> {
    // this adds the preset to tsParticles, you can safely use the
    await loadConfettiPreset(engine);
  }

  render() {
    const options = {
      preset: "confetti",
    };

    return <Particles options={options} init={this.customInit} />;
  }
}