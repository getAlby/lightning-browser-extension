import React from 'react';
import styles from './BoostButton.module.css';
import CountUp from 'react-countup';
import {ReactComponent as LoadingIndicator} from './loading.svg';
import {ReactComponent as AlbyLogo} from './logo.svg';
export default class BoostButton extends React.Component<BoostButtonProps, BoostButtonState> {

  buttonEl: React.RefObject<HTMLDivElement>;
  spanEl: React.RefObject<HTMLDivElement>;

  state: BoostButtonState = {
    loading: false,
    amount: 0,
    pressed: false,
    paid: false,
  }
  timeout: NodeJS.Timeout;
  
  async click(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    this.playSound();

    this.setState({ amount: this.state.amount + 21 });   
    if(this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(async () => {
      await this.pay();
    }, 2000);
  }

  playSound() {
    const clickEffect = new Audio("https://cdn.pixabay.com/audio/2022/03/10/audio_18fa31cc65.mp3");
    clickEffect.play();
  }

  async mouseDown() {
    this.setState({ pressed: true });
  }

  async mouseUp() {
    this.setState({ pressed: false });
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
      console.error(e);
    }

    this.setState({ loading: false, amount: 0 });
  }

  render() {
    return <div className={styles.BoostButton} 
              style={{
                transform: this.state.pressed ? 'scale(0.9)' : "none",
                backgroundImage: this.state.paid ? `url('https://secure.gravatar.com/avatar/07e22939e7672b38c56615068c4c715f?size=200&default=mm&rating=g')` : ''
              }}
              onMouseDown={() => this.mouseDown()} 
              onMouseUp={() => this.mouseUp()} 
              onClick={(e) => this.click(e)}>

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
                      <span className={styles.amount}>
                        <CountUp preserveValue={true} duration={0.2} end={this.state.amount} />
                      </span>                    
                      <div style={{'textAlign' : 'center'}}>sats</div>
                    </div>
                  }
                </div>
              }
              {this.state.paid && <div>
                <span style={{color: '#FFF', fontWeight: 'bold'}}>Thanks!</span>
              </div>} 
           </div>;
  }
}

class BoostButtonProps {
  lnurl!: string;
}

class BoostButtonState {
  loading: boolean = false;
  amount: number = 0;
  pressed: boolean = false;
  paid: boolean = false;
}