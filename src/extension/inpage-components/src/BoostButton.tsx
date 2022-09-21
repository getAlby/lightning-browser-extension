import React from 'react';
import './BoostButton.css';
import Particles from "react-particles";
import type { Engine } from "tsparticles-engine";
import { loadConfettiPreset } from "tsparticles-preset-confetti";


export default class BoostButton extends React.Component<BoostButtonProps, BoostButtonState> {

  buttonEl: React.RefObject<HTMLDivElement>;
  spanEl: React.RefObject<HTMLDivElement>;

  state: BoostButtonState = {
    text: "21"
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
    var invoice = await window.alby.lnurl(this.props.lnurl, { amount: 1 });
    console.log(invoice);

    this.setState({ text: (parseInt(this.state.text) + 1).toString() });
  }

  render() {
    return <div className="BoostButton" onClick={(e) => this.click(e)} ref={this.buttonEl} onMouseEnter={(e) => this.mouseEnter(e)} onMouseMove={(e) => this.mouseMove(e)} onMouseLeave={(e) => this.mouseLeave(e)}>   
            <div ref={this.spanEl}>
              <span>🐝</span>
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