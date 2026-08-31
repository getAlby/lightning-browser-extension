// JSDOM ships no MessageChannel, which the provider transport is built on.
// A minimal stand-in: two entangled ports that deliver to each other only, with
// messages buffered until start() as the real thing does.
//
// It is installed per test file rather than globally: msw relies on the real
// MessageChannel and misbehaves when the global is replaced for every suite.

type Listener = ((ev: { data: unknown }) => void) | null;

class FakeMessagePort {
  onmessage: Listener = null;
  _other: FakeMessagePort | null = null;
  _started = false;
  _closed = false;
  _buffered: unknown[] = [];

  start() {
    if (this._started) return;
    this._started = true;
    while (this._buffered.length) this._deliver(this._buffered.shift());
  }

  close() {
    this._closed = true;
  }

  postMessage(data: unknown) {
    const other = this._other;
    if (!other || other._closed) return;
    // queued rather than delivered synchronously, as a real port does
    Promise.resolve().then(() => other._receive(data));
  }

  _receive(data: unknown) {
    if (!this._started) {
      this._buffered.push(data);
      return;
    }
    this._deliver(data);
  }

  _deliver(data: unknown) {
    if (this.onmessage) this.onmessage({ data });
  }
}

class FakeMessageChannel {
  port1: FakeMessagePort;
  port2: FakeMessagePort;
  constructor() {
    this.port1 = new FakeMessagePort();
    this.port2 = new FakeMessagePort();
    this.port1._other = this.port2;
    this.port2._other = this.port1;
  }
}

// Installs the stand-in for the current test file and returns a restore
// function that puts back whatever was there before.
export function installFakeMessageChannel() {
  const previous = (global as Record<string, unknown>).MessageChannel;
  (global as Record<string, unknown>).MessageChannel = FakeMessageChannel;
  return () => {
    (global as Record<string, unknown>).MessageChannel = previous;
  };
}
