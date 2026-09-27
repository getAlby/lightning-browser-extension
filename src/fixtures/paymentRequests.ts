// Prerecorded BOLT11 invoices used by the tests, keyed by their millisatoshi
// amount ("amountless" for an invoice with no amount). They were minted once
// with a fixed key and all share the same payment hash and "test" description;
// only the amount differs. This replaces an on-the-fly encoder so the fixtures
// no longer depend on a full BOLT11 signer.
const PAYMENT_REQUESTS: Record<string, string> = {
  amountless:
    "lnbc1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpft0cw5gqwvlsdspysa98424v8p23tgrausfh080dkq6223nk39e8z9cj8ckmg8l4h5guxnjdn9u959sfqxz3gjujxllqemzej80c76rspr0vu5h",
  "0": "lnbc0p1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpfvme9s70yrskcku25lxq0aans6d2mnnzgl32axgweem4drzftc8fxuarr2xh05pt08679f30v5jhqsf78hs9fq4p0nfulg9dfgdtdffcqqxqzh9",
  "1": "lnbc10p1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpfkvsc3ku7t7g0css62akrh7vr84t45njzhejchl9pkwh90ucuugwju7cnhe96gftad9vd70jeqza04nyx8hxvqxg9h365sgkd3z29sxspxyv5ya",
  "999":
    "lnbc9990p1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpfgp3ctrycxfcfhrfda99aqdns6fqppnjn9papldc4srk69vz07g99qhqg7dkgxrzrf3ns6qgva97rpatycpvymyjqr4rctdve3r0e2fcpmtzr22",
  "100000":
    "lnbc1u1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpfnlz879sh2y5mdnswq9szg7m4kwlhlha946uwgrjg3xuhsey8aaexqa53jf72gltafw0p4n0z58rwz5wcq40vu26l6vcpy5qu64hvztgq99jgvl",
  "100500":
    "lnbc1005n1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpfgtvt0fk7pwp8ykst9ps2dwjlj7vucwgg75zkcfhcl6vmndqs78tpkfc7w9nxv3aay2jdw34uejymarwfp6jxnnl3yh9etwaax6u7rmsp3mjrss",
  "200000":
    "lnbc2u1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpf0h6fd5j2ngfrufs0d9qyw6l947wcrwhtzgsrf49azjvdux6kn0mpdpz9w5wlmmyydzlkhgkwu6fu0lxepm4zp2xduwd4t90c239h9qgq8tas57",
  "600000":
    "lnbc6u1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpfjzr4377ah5v7gphyne7ugtwn8thx99x3qredmf5228mvv4zltg9rks4zv706tsvp4wajqzn0dga5usg3ujhzuypvl68ea6nvt5pxevqpyx8hq4",
  "1000000":
    "lnbc10u1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpfsj5h50xvxyc64g7hn97anyfm4wupcrf5d3tayuzu3n2jmlvyds24cvc3jdp960hm8gaj9gxrtjs5epxepwyed6k76jz2050a8d2vlmcp9hcjr0",
  "1000500":
    "lnbc10005n1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpfw65gegkual7j3l6mmcf2l9p2pdq9ypmnkyxyrh6eczpc70wuywpkhh7tj0uyngwym7l5lvcjhqw222rzhsnsh7px372z98wjelksw6gp23j97e",
  "50000001":
    "lnbc500000010p1p4t0t4upp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq8w3jhxaqxqrrsscqpf8nzgfgg72k32f3rsqlstk8qyvr9fn0vxfmr7dav6srxc4qu0g0dnk4zqwrzqfcl05m4hlkrk8f0rtfy7mq73t3yl527pgfx2rc46yycpe778at",
};

// Returns a prerecorded BOLT11 invoice for the given amount; omit
// `millisatoshis` for an amountless one. Only the amounts the tests use are
// recorded — add a new entry (mint it with a BOLT11 encoder) before using a new
// amount.
export function createPaymentRequest(millisatoshis?: number): string {
  const key =
    millisatoshis === undefined ? "amountless" : String(millisatoshis);
  const paymentRequest = PAYMENT_REQUESTS[key];
  if (!paymentRequest) {
    throw new Error(
      `No prerecorded payment request for millisatoshis=${key}. Add one to src/fixtures/paymentRequests.ts.`
    );
  }
  return paymentRequest;
}
