import React from "react";
import CountUp from "react-countup";

import styles from "./BoostButton.module.css";
import { ReactComponent as LoadingIndicator } from "./loading.svg";
import { ReactComponent as AlbyLogo } from "./logo.svg";

enum Step {
  Start = 0,
  Pay = 1,
  Error = 2,
  Thankyou = 3,
}

export default class BoostButton extends React.Component<
  BoostButtonProps,
  BoostButtonState
> {
  state: BoostButtonState = {
    loading: false,
    amount: 0,
    pressed: false,
    step: Step.Start,
    errorMessage: "",
  };

  timeout: NodeJS.Timer | null = null;
  pressedInterval: NodeJS.Timer | null = null;

  async mouseDown() {
    if (this.state.step !== Step.Start) {
      return;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.setState({ pressed: true });

    let pressedCount = 0;
    this.pressedInterval = setInterval(() => {
      pressedCount++;
      this.setState({ amount: this.state.amount + pressedCount });
    }, 50);
  }

  async mouseUp() {
    if (this.state.step !== Step.Start) {
      return;
    }

    this.setState({ pressed: false, amount: this.state.amount + 21 });

    this.pressedInterval && clearInterval(this.pressedInterval);
    this.timeout && clearTimeout(this.timeout);

    this.timeout = setTimeout(async () => {
      await this.pay();
    }, 2000);
  }

  async mouseLeave() {
    this.setState({ pressed: false });

    this.pressedInterval && clearInterval(this.pressedInterval);

    if (this.state.pressed) {
      this.timeout = setTimeout(async () => {
        await this.pay();
      }, 2000);
    }
  }

  async pay() {
    this.setState({ loading: true });

    try {
      var result = (await window.alby.lnurl(
        this.props.lnurl,
        this.state.amount,
        "🚀"
      )) as any;
      await window.webln.enable();
      await window.webln.sendPayment(result.pr);

      // TODO: Add preimage validation

      this.setState({ step: Step.Thankyou });
    } catch (e) {
      console.error(e);
      this.setState({ step: Step.Error, errorMessage: "Payment failed" });
    }

    setTimeout(() => {
      this.reset();
    }, 5000);
  }

  reset() {
    this.setState({ step: Step.Start, amount: 0, loading: false });
  }

  render() {
    const localStyles = {
      transform: this.state.pressed ? "scale(0.9)" : "none",
    } as any;

    if (this.state.step === Step.Thankyou && this.props.image) {
      localStyles.backgroundImage = `url('${this.props.image}')`;
    }

    if (this.state.step === Step.Error) {
      localStyles.backgroundImage = `linear-gradient(180deg, #ff6b6b, #f34646)`;
    }

    return (
      <div
        className={styles.BoostButton}
        style={localStyles}
        onMouseDown={() => this.mouseDown()}
        onMouseUp={() => this.mouseUp()}
        onMouseLeave={() => this.mouseLeave()}
      >
        {this.state.step === Step.Start && this.state.loading && (
          <div>
            <LoadingIndicator />
          </div>
        )}
        {this.state.step === Step.Error && (
          <div>
            ❌<br />
            {this.state.errorMessage}
          </div>
        )}
        {this.state.step === Step.Start && !this.state.loading && (
          <div>
            {this.state.amount === 0 && <AlbyLogo />}
            {this.state.amount > 0 && (
              <div>
                <div className={styles.amount}>
                  <CountUp
                    preserveValue={true}
                    duration={0.2}
                    end={this.state.amount}
                  />
                </div>
                <div className={styles.sats}>sats</div>
              </div>
            )}
          </div>
        )}
        {this.state.step === Step.Thankyou && (
          <div>
            {!this.props.image && <AlbyLogo />}
            <span className={styles.thanks}>Thanks! 🙌</span>
          </div>
        )}
      </div>
    );
  }
}

class BoostButtonProps {
  lnurl!: string;
  image?: string;
}

class BoostButtonState {
  loading: boolean = false;
  amount: number = 0;
  pressed: boolean = false;
  step: Step = Step.Start;
  errorMessage: string = "";
}
