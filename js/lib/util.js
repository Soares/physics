const TAU = 2 * Math.PI;

const NotImplemented = new Error('not implemented');

const assert = (fact, message) => {
  if (!fact) { throw new Error(`assertion failure: #{message}`); }
}

const id = (x) => x;

const constant = (c) => (x) => c;

// with add and sub, y is vaguely expected to have the same type as x.
// (this is not enforced).
const add = (x, y) => x.add ? x.add(y) : x + y;
const sub = (x, y) => x.sub ? x.sub(y) : x - y;
// with scale and over, y is vaguely expected to be a scalar.
// (this is not enforced).
const scale = (x, y) => x.scale ? x.scale(y) : x * y;
const over = (x, y) => x.over ? x.over(y) : x / y;
// With mul, x, y, and the output might be different types.
// (consider, e.g., matrix multiplication).
const mul = (x, y) => x.mul ? x.mul(y) : x * y;

const sum = (xs, f = id, zero = 0) =>
  xs.reduce((total, x) => add(total, f(x)), zero);
const product = (xs, f = id, one = 1) =>
  xs.reduce((total, x) => mul(total, f(x)), one);

const range = (length, start=0, step = 1) =>
  Array(length).fill().map((_, i) => (i + start) * step);

const min = (xs, f = id) => Math.min(...xs.map((x) => f(x)));
const max = (xs, f = id) => Math.max(...xs.map((x) => f(x)));

const zip = (f, ...arrays) => {
  const length = min(arrays, (arr) => arr.length);
  return range(length).map((i) => f(...arrays.map((arr) => arr[i])));
};

const isRealSmall = (x) => Math.abs(x) < 1e-12;

// From: https://developer.mozilla.org/en-US/docs/Web/Events/resize
const throttleEvent = function(type, name, obj = window) {
  let running = false;
  const handler = () => {
    if (running) { return; }
    running = true;
    requestAnimationFrame(() => {
      obj.dispatchEvent(new CustomEvent(name));
      running = false;
    });
  };
  obj.addEventListener(type, handler);
};

const sigmoid = (x) => 1/(1+Math.exp(-x));

const last = (xs) => xs[xs.length - 1];

(function() {
  throttleEvent('resize', 'optimizedResize');
})();
