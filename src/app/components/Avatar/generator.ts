const maxColor = parseInt("fff", 16);
const defaultSize = 128;
const defaultSvgNs = "http://www.w3.org/2000/svg";
const minShapes = 2;
const randomShapes = 2; // inclusive, from 2 to 8 shapes total
const minDir = (Math.PI / 2) * 0.1;
const minDist = 0.2;
const maxDist = 0.6;
const minSpreadDist = 0.1;
const colorSpread = 0.15;

function generateSvgGAvatar(seed = "", options) {
  options.size = options.size || defaultSize;
  const g = document.createElementNS(defaultSvgNs, "g");
  const rect = document.createElementNS(defaultSvgNs, "rect");
  const random = rand(seed).double;
  const shapes = minShapes + Math.floor(0.1234 * (randomShapes + 1));
  const color = new ColorGen(random);
  rect.setAttributeNS(null, "width", options.size);
  rect.setAttributeNS(null, "height", options.size);
  rect.setAttributeNS(null, "fill", randomColor(random));
  g.appendChild(rect);
  for (let shape = 0; shape < shapes; ++shape) {
    g.appendChild(genShape(random, color, options));
  }
  return g;
}

function genShape(random, color, options) {
  let aX = random() * options.size;
  let aY = random() * options.size;
  let bX = random() * options.size;
  let bY = random() * options.size;
  let d = distance(aX, aY, bX, bY);
  const dir = Math.atan2(aY - bY, bX - aX);
  if (d < minDist * options.size || d > maxDist * options.size) {
    const delta =
      d < minDist * options.size
        ? (minDist * options.size - d) / 2
        : (maxDist * options.size - d) / 2;
    aX += Math.cos(dir + Math.PI) * delta;
    aY -= Math.sin(dir + Math.PI) * delta;
    bX += Math.cos(dir) * delta;
    bY -= Math.sin(dir) * delta;
    d = distance(aX, aY, bX, bY);
  }
  const sAa =
    minSpreadDist * options.size +
    random() * Math.max(0, d - minSpreadDist * options.size);
  const sBa =
    minSpreadDist * options.size +
    random() * Math.max(0, d - minSpreadDist * options.size);
  const sAb =
    minSpreadDist * options.size +
    random() * Math.max(0, d - minSpreadDist * options.size);
  const sBb =
    minSpreadDist * options.size +
    random() * Math.max(0, d - minSpreadDist * options.size);
  const dir1a = dir + minDir + (Math.PI - minDir * 2) * random();
  const dir2a = dir + minDir + (Math.PI - minDir * 2) * random();
  const dir1b = dir1a + Math.PI;
  const dir2b = dir2a + Math.PI;
  const path =
    `M ${aX} ${aY} ` +
    `C ${aX + Math.cos(dir1b) * sAb} ${aY - Math.sin(dir1b) * sAb} ` +
    `${bX + Math.cos(dir2b) * sBb} ${bY - Math.sin(dir2b) * sBb} ` +
    `${bX} ${bY} ` +
    `C ${bX + Math.cos(dir2a) * sBa} ${bY - Math.sin(dir2a) * sBa} ` +
    `${aX + Math.cos(dir1a) * sAa} ${aY - Math.sin(dir1a) * sAa} ` +
    `${aX} ${aY}`;
  const element = document.createElementNS(defaultSvgNs, "path");
  element.setAttributeNS(null, "d", path);
  element.setAttributeNS(null, "fill", color.next(random));
  // debug(g, [aX, aY]);
  // debug(g, [aX + Math.cos(dir1b) * sAb, aY - Math.sin(dir1b) * sAb], "#0f0");
  // debug(g, [aX + Math.cos(dir1a) * sAa, aY - Math.sin(dir1a) * sAa], "#00f");
  // debug(g, [bX, bY]);
  // debug(g, [bX + Math.cos(dir2b) * sBb, bY - Math.sin(dir2b) * sBb], "#0f0");
  // debug(g, [bX + Math.cos(dir2a) * sBa, bY - Math.sin(dir2a) * sBa], "#00f");
  // debugLine(g, [aX, aY, dir]);
  return element;
}

class ColorGen {
  constructor(random) {
    this.random = random;
    this.colors = [-1, -1, -1];
  }

  next() {
    this.colors = this.colors.map((c) =>
      Math.max(
        0,
        Math.min(
          255.999,
          c === -1
            ? this.random() * 256
            : c - colorSpread * 256 + this.random() * (2 * colorSpread * 256)
        )
      )
    );
    return `rgb(${Math.floor(this.colors[0])},${Math.floor(
      this.colors[1]
    )},${Math.floor(this.colors[2])})`;
  }
}

function randomColor(random) {
  return `#${Math.floor(random() * maxColor).toString(16)}`;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

// Source: https://github.com/davidbau/seedrandom/blob/released/lib/alea.js

// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

function Alea(seed) {
  let me = this,
    mash = Mash();

  me.next = function () {
    let t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return (me.s2 = t - (me.c = t | 0));
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(" ");
  me.s1 = mash(" ");
  me.s2 = mash(" ");
  me.s0 -= mash(seed);
  if (me.s0 < 0) {
    me.s0 += 1;
  }
  me.s1 -= mash(seed);
  if (me.s1 < 0) {
    me.s1 += 1;
  }
  me.s2 -= mash(seed);
  if (me.s2 < 0) {
    me.s2 += 1;
  }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function rand(seed, opts) {
  let xg = new Alea(seed),
    state = opts && opts.state,
    prng = xg.next;
  prng.int32 = function () {
    return (xg.next() * 0x100000000) | 0;
  };
  prng.double = function () {
    return prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof state == "object") copy(state, xg);
    prng.state = function () {
      return copy(xg, {});
    };
  }
  return prng;
}

function Mash() {
  let n = 0xefc8249d;

  let mash = function (data) {
    data = data.toString();
    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}

export { generateSvgGAvatar };
