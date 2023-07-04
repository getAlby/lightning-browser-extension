const defaultSize = 128;
const defaultSvgNs = "http://www.w3.org/2000/svg";
const minShapes = 2;
const randomShapes = 2; // inclusive, from 2 to 8 shapes total
const minDir = (Math.PI / 2) * 0.1;
const minDist = 0.2;
const maxDist = 0.6;
const minSpreadDist = 0.1;
const colorSpread = 0.15;

type Options = {
  size: number;
};

function generateSvgGAvatar(seed = "", options: Options) {
  options.size = options.size || defaultSize;
  const g = document.createElementNS(defaultSvgNs, "g");
  const rect = document.createElementNS(defaultSvgNs, "rect");
  const random = new RandomGenerator(seed).double;
  const shapes = minShapes + Math.floor(0.1234 * (randomShapes + 1));
  const color = new ColorGenerator(random);
  rect.setAttributeNS(null, "width", options.size.toString());
  rect.setAttributeNS(null, "height", options.size.toString());
  rect.setAttributeNS(null, "fill", randomColor(random));
  g.appendChild(rect);
  for (let shape = 0; shape < shapes; ++shape) {
    g.appendChild(genShape(random, color, options));
  }
  return g;
}

function genShape(
  random: () => number,
  color: ColorGenerator,
  options: Options
) {
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
  element.setAttributeNS(null, "fill", color.next());
  return element;
}

class ColorGenerator {
  private random: () => number;
  private colors: number[];

  constructor(random: () => number) {
    this.random = random;
    this.colors = [-1, -1, -1];
  }

  public next(): string {
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

function randomColor(random: () => number): string {
  const maxColor = 16777215; // 0xffffff
  return `#${Math.floor(random() * maxColor).toString(16)}`;
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
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

class Alea {
  private c: number;
  private s0: number;
  private s1: number;
  private s2: number;

  constructor(seed: string) {
    const mash = Mash();

    this.next = this.next.bind(this);

    this.c = 1;
    this.s0 = mash(" ");
    this.s1 = mash(" ");
    this.s2 = mash(" ");

    this.s0 -= mash(seed);
    if (this.s0 < 0) {
      this.s0 += 1;
    }

    this.s1 -= mash(seed);
    if (this.s1 < 0) {
      this.s1 += 1;
    }

    this.s2 -= mash(seed);
    if (this.s2 < 0) {
      this.s2 += 1;
    }
  }

  public next(): number {
    const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
    this.s0 = this.s1;
    this.s1 = this.s2;
    this.c = t | 0;
    this.s2 = t - this.c;
    return this.s2;
  }
}

class RandomGenerator {
  private xg: Alea;
  private state?: object;

  constructor(seed: string) {
    this.xg = new Alea(seed);
    this.double = this.double.bind(this);
  }

  double = (): number => {
    const prng = this.xg.next;
    return prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16; // 2^-53
  };
}
function Mash() {
  let n = 0xefc8249d;

  const mash = function (data: string) {
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
