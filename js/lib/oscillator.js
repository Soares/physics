class HarmonicOscillator {
  constructor (a, b, period = TAU) {
    this.a = a;
    this.b = b;
    this.period = period;
  }

  at (time) {
    return HarmonicOscillator.at(this.a, this.b, this.period * time);
  }

  derivative () {
    return new HarmonicOscillator(
        this.period * this.b, -this.period * this.a, this.period);
  }

  static at (a, b, x) {
    return a * Math.cos(x) + b * Math.sin(x);
  }
};
