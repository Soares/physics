class Coordinate {
  // Postmature optimization: Updating coordinates is one of our most expensive
  // operations. If you implement a coordinate and want it to run faster, set
  // _canMutate to true, and _shift(i, delta) (where 0 <= i < dimension). In
  // that case, your constructor should take ...args as input where args has
  // length dimension. Otherwise we'll use .add(unit(i).scale(delta)) to get
  // the new coordinate, and we'll use fromArray to create the new one.
  _canMutate () { return false; }

  static fromArray (array) { return new this(...array); }
  static fill (n, value) { return this.fromArray(Array(n).fill(value)); }
  static unit (n, i, zero = 0, one = 1) {
    const values_n = Array(n).fill(zero);
    values_n[i] = one;
    return this.fromArray(values_n);
  }

  // A number.
  get dimension () { return this.values.length; }

  // Dimensions as an array.
  get values () { throw NotImplemented; }

  // New vector that is the same except that the ith coordinate is set to v.
  alter (i, v) {
    const altered = this.value.slice();
    altered[i] = v;
    return this.constructor.fromArray(altered);
  }

  map (fn) {
    return this.constructor.fromArray(this.values.map((v, i) => fn(v, i)));
  }

  reduce (f, initial = 0) {
    return this.constructor.fromArray(
        this.values.reduce((total, v, i) => f(total, v, i), initial));
  }

  zip (f, ...others) {
    const otherArrays = others.map((o) => o.values);
    return this.constructor.fromArray(zip(f, this.values, ...otherArrays));
  }

  add (other) { return this.zip(add, other); }

  sub (other) { return this.zip(sub, other); }

  scale (scalar) { return this.map((v) => scale(v, scalar)); }

  over (scalar) { return this.map((v) => over(v, scalar)); }

  negate () { return this.scale(-1); }
}
