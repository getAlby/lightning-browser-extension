import React from 'react';
import styles from './BoostButton.module.css';
import CountUp from 'react-countup';
import {ReactComponent as LoadingIndicator} from './loading.svg';
import {ReactComponent as AlbyLogo} from './logo.svg';
export default class BoostButton extends React.Component<BoostButtonProps, BoostButtonState> {

  state: BoostButtonState = {
    loading: false,
    amount: 0,
    pressed: false,
    paid: false,
  }

  timeout: NodeJS.Timeout;
  pressedInterval: NodeJS.Timeout;
  
  async mouseDown() {
    if(this.state.paid) {
      return;
    }

    clearTimeout(this.timeout);
    this.setState({ pressed: true });

    let pressedCount = 0;
    this.pressedInterval = setInterval(() => {
      pressedCount++;
      this.setState({ amount: this.state.amount + pressedCount});
    }, 50);
  }

  async mouseUp() {
    if(this.state.paid) {
      return;
    }

    this.setState({ pressed: false, amount: this.state.amount + 21 });

    clearInterval(this.pressedInterval);
    clearTimeout(this.timeout);
    
    this.timeout = setTimeout(async () => {
      await this.pay();
    }, 2000);
    
  }

  async mouseLeave() {
    this.setState({ pressed: false });
    clearInterval(this.pressedInterval);
    
    if(this.state.pressed) {
      this.timeout = setTimeout(async () => {
        await this.pay();
      }, 2000);
    }    
  }

  async pay() {
    this.setState({ loading: true });

    try {
      var result = await window.alby.lnurl(this.props.lnurl, this.state.amount, "🚀") as any;
      await window.webln.enable();
      var paymentResult = await window.webln.sendPayment(result.pr);
      if(paymentResult.preimage !== result.preimage) {
        throw new Error("Preimage does not match.")
      }

      this.setState({ paid: true });
      setTimeout(() => { this.setState({ paid: false })}, 5000);
    }
    catch(e) {
      this.setState({ paid: true });
      console.error(e);
    }

    this.setState({ loading: false, amount: 0 });
  }
  
  render() {
    const localStyles = {
      transform: this.state.pressed ? 'scale(0.9)' : "none",
    } as any;

    if(this.state.paid && this.props.image) {
      localStyles.backgroundImage = `url('${this.props.image}')`;
    }

    return <div className={styles.BoostButton} 
              style={localStyles}
              onMouseDown={() => this.mouseDown()} 
              onMouseUp={() => this.mouseUp()}
              onMouseLeave={() => this.mouseLeave()}>
              {!this.state.paid && this.state.loading && <div>
                <LoadingIndicator/>
              </div>}
              {!this.state.paid && !this.state.loading && 
                <div>
                  {this.state.amount === 0 && 
                    <AlbyLogo/>
                  }
                  {this.state.amount > 0 && 
                    <div>
                      <div className={styles.amount}>
                        <CountUp preserveValue={true} duration={0.2} end={this.state.amount} />
                      </div>                    
                      <div className={styles.sats}>sats</div>
                    </div>
                  }
                </div>
              }
              {this.state.paid && <div>
                {!this.props.image && <AlbyLogo/>}
                <span className={styles.thanks}>Thanks! 🙌</span>
              </div>} 
           </div>;
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
  paid: boolean = false;
}