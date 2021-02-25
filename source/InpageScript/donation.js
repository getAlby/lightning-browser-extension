import shajs from "sha.js";

class Donation {
  constructor(location) {
    this.location = location;
  }

  getHash() {
    return shajs("sha256").update(this.location).digest("hex");
  }

  getRule() {
    const hash = this.getHash();
    return fetch(`https://area402.herokuapp.com/domains/check?id=${hash}`)
      .then((resp) => resp.json())
      .catch((e) => {
        return null;
      });
  }

  getInvoice(rule) {
    return fetch(rule.invoice_url, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: rule.amount }),
    })
      .then((resp) => resp.json())
      .catch((e) => {
        return null;
      });
  }

  execute() {
    return this.getRule().then((rule) => {
      console.log({ rule });
      let isExecuting = false;
      if (!rule) {
        return;
      }
      const donate = () => {
        if (isExecuting) {
          return;
        }
        isExecuting = true;
        this.getInvoice(rule).then((invoice) => {
          console.log({ invoice });
          window.webln.enable().then(() => {
            window.webln.sendPayment(invoice.payment_request).then((r) => {
              isExecuting = false;
            });
          });
        });
      };

      if (rule.interval) {
        setInterval(donate, rule.interval);
      } else {
        donate();
      }
    });
  }
}

export default Donation;
