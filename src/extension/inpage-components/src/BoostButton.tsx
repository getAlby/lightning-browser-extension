import React from 'react';
import './BoostButton.css';

export default class BoostButton extends React.Component<BoostButtonProps, BoostButtonState> {

  buttonEl: React.RefObject<HTMLButtonElement>;
  spanEl: React.RefObject<HTMLSpanElement>;

  state: BoostButtonState = {
    text: "21"
  }

  constructor(props: BoostButtonProps) {
    super(props);

    this.buttonEl = React.createRef();
    this.spanEl = React.createRef();
  }

  mouseEnter(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!this.spanEl.current || !this.buttonEl.current) return;

    calculateAngle(e, this.spanEl.current, this.buttonEl.current);
  }

  mouseMove(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!this.spanEl.current || !this.buttonEl.current) return;

    calculateAngle(e, this.spanEl.current, this.buttonEl.current);
  }

  mouseLeave(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {

    if (!this.spanEl.current || !this.buttonEl.current) return;

    let dropShadowColor = `rgba(0, 0, 0, 0.3)`
    const attribute = this.buttonEl.current.getAttribute('data-filter-color');
    if (attribute) {
      dropShadowColor = attribute;
    }
    this.spanEl.current.style.transform = `rotateY(0deg) rotateX(0deg) scale(1)`;
    this.spanEl.current.style.filter = `drop-shadow(0 10px 15px ${dropShadowColor})`;

  }

  click(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    this.setState({ text: (parseInt(this.state.text) + 1).toString() });
  }

  render() {
    return <button className="purple" onClick={(e) => this.click(e)} ref={this.buttonEl} onMouseEnter={(e) => this.mouseEnter(e)} onMouseMove={(e) => this.mouseMove(e)} onMouseLeave={(e) => this.mouseLeave(e)}>
      <span ref={this.spanEl}>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
         width="122" height="140">
          <defs>
  <pattern id="avatar" patternUnits="userSpaceOnUse" width="100" height="100">
    <image href="https://secure.gravatar.com/avatar/07e22939e7672b38c56615068c4c715f?size=200&default=mm&rating=g" x="0" y="0" width="100" height="100" />
  </pattern>
</defs>
          <path fill="url(#avatar)" d="M56.29165124598851 2.4999999999999996Q60.6217782649107 0 64.9519052838329 2.5L116.9134295108992 32.5Q121.2435565298214 35 121.2435565298214 40L121.2435565298214 100Q121.2435565298214 105 116.9134295108992 107.5L64.9519052838329 137.5Q60.6217782649107 140 56.29165124598851 137.5L4.330127018922193 107.5Q0 105 0 100L0 40Q0 35 4.330127018922194 32.5Z"></path></svg>
        <span>🚀 {this.state.text}</span>
      </span>
    </button>
      ;
  }
}


let calculateAngle = function (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: HTMLElement, parent: HTMLElement) {
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