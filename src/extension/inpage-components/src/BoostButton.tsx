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
    step: 'start',
    errorMessage: '',
  }

  timeout: NodeJS.Timeout;
  pressedInterval: NodeJS.Timeout;
  
  async mouseDown() {
    if(this.state.step != 'start') {
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
    if(this.state.step != 'start') {
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

      this.setState({ step: 'thankyou' });
    }
    catch(e) {
      console.error(e);
      this.setState({ step: 'error', errorMessage: "Payment failed" });
    }

    setTimeout(() => { this.reset() }, 5000);
  }

  reset() {
    this.setState({ step: 'start', amount: 0, loading: false })
  }
  
  render() {
    const localStyles = {
      transform: this.state.pressed ? 'scale(0.9)' : "none",
    } as any;

    if(this.state.step == 'thankyou' && this.props.image) {
      localStyles.backgroundImage = `url('${this.props.image}')`;
    }

    if(this.state.step == 'error') {
      localStyles.backgroundImage = `linear-gradient(180deg, #ff6b6b, #f34646)`;
    }

    return <div className={styles.BoostButton} 
              style={localStyles}
              onMouseDown={() => this.mouseDown()} 
              onMouseUp={() => this.mouseUp()}
              onMouseLeave={() => this.mouseLeave()}>
              {this.state.step == 'start' && this.state.loading && <div>
                <LoadingIndicator/>
              </div>}
              {this.state.step == 'error' && <div>
                😥<br/>{this.state.errorMessage}
              </div>
              }
              {this.state.step !='pay' && !this.state.loading && 
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
              {this.state.step == 'thankyou' && <div>
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
  step: string = "";
  errorMessage: string = "";
}