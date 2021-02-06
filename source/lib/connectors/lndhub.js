import memoizee from 'memoizee';
import utils from '../utils';

export default class LndHub {
  constructor(config) {
    this.config = config;
    this.getInfo = memoizee(
      (args) => this.request('GET', '/getinfo', undefined, {}),
      { promise: true, maxAge: 20000, preFetch: true, normalizer: () => 'getinfo' }
    );
    this.getBalance = memoizee(
      (args) => this.request('GET', '/balance', undefined, {}),
      { promise: true, maxAge: 20000, preFetch: true, normalizer: () => 'balance' }
    )
  }

  async init() {
    return this.authorize();
  }

  sendPayment(args) {
    return this.request('POST', '/payinvoice', {
      invoice: args.paymentRequest
    }).then(result => {
      utils.notify({
        title: "Paid",
        message: `pre iamge:`
      })
    })
  }

  makeInvoice(args) {
    return this.request('POST', '/addinvoice', {
      amt: args.amount,
      memo: args.defaultMemo
    });
  }

  async authorize() {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Content-Type', 'application/json');
    return fetch(this.config.url + '/auth?type=auth', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({login: this.config.login, password: this.config.password}),
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('API error: ' + response.status);
        }
      })
      .then(json => {
        if (typeof json === 'undefined') {
          throw new Error('API failure: ' + response.err + ' ' + JSON.stringify(response.body));
        }
        if (json && json.error) {
          throw new Error('API error: ' + json.message + ' (code ' + json.code + ')');
        }
        if (!json.access_token || !json.refresh_token) {
          throw new Error('API unexpected response: ' + JSON.stringify(json));
        }

        this.refresh_token = json.refresh_token;
        this.access_token = json.access_token;
        this.refresh_token_created = +new Date();
        this.access_token_created = +new Date();
        return json;
      });
  }

  async request(method, path, args, defaultValues) {
    if (!this.access_token) {
      await this.authorize();
    }
    let body = null;
    let query = '';
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer' + ' ' + this.access_token);

    if (method === 'POST') {
      body = JSON.stringify(args);
    }
    else if (args !== undefined) {
      query = `?`; //`?${stringify(args)}`;
    }
    const res = await fetch(this.config.url + path + query, {
      method,
      headers,
      body,
    });
    if (!res.ok) {
      errBody = await res.json();
      console.log('errBody', errBody);
      throw new Error(errBody);
    }
    let data = await res.json();
    if (data && data.error) {
      if (data.code * 1 === 1 && !this.noRetry) {
        await this.authorize();
        this.noRetry = true;
        return this.request(method, path, args, defaultValues);
      }
    }
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    return {data};
  }
}