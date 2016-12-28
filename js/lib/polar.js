class Polar extends Coordinate {
  constructor (r, theta) {
      super();
      this._r = r;
      this._theta = theta;
  }
  static cartesian (x, y) {
    return new Polar(Math.sqrt(x**2 + y**2), Math.atan2(y, x));
  }

  get _canMutate () { return true; }
  _shift (i, delta) {
    if (i == 0) { this._r += delta; }
    else { this._theta += delta; }
  }

  get dimension () { return 2; }
  get values () { return [this.r, this.theta]; }
  get x () { return this._r * Math.cos(this._theta); }
  get y () { return this._r * Math.sin(this._theta); }
  get r () { return this._r; }
  get theta () { return this._theta; }
  get rSquared () { return this._r ** 2; }
  get orthogonal () { return new Polar(this._r, this._theta + TAU/4); }
  get conjugate () { return new Polar(this._r, -this._theta); }
  extend (r) { return new Polar(this._r + r, this._theta); }
  rotate (theta) { return new Polar(this._r, this._theta + theta); }
  complexMul (other) {
    return new Polar(this._r * other.r, this._theta + other.theta);
  }
  complexAdd (other) {
    return Polar.cartesian(this.x + other.x, this.y + other.y);
  }
  get normSquared () { return this.rSquared; }
  standardForm () {
    if (this.r < 0) { return new Polar(-this.r, (this.theta + TAU/2) % TAU); }
    else { return new Polar(this.r, this.theta % TAU); }
  }

  equals (other) { return other._r == this._r && other._theta == this._theta; }

  // These functions *are not* like complex addition. They are monstrosities
  // where we directly add/sub/scale/divide the polar coordinates. Use
  // complexMul and complexAdd for the sane things.
  add (other) {
    return new Polar(this._r + other._r, this._theta + other._theta);
  }
  sub (other) {
    return new Polar(this._r - other._r, this._theta - other._theta);
  }
  scale (scalar) {
    return new Polar(this._r * scalar, this._theta * scalar);
  }
  over (scalar) {
    return new Polar(this._r / scalar, this._theta / scalar);
  }
  dot (other) {
    return new Polar(
        this._r * other._r,
        Math.cos(this._theta - other._theta));
  }
}

Polar.zero = new Polar(0, 0);
Polar.one = new Polar(1, 0);
Polar.i = new Polar(1, TAU/4);
Polar.negone = new Polar(1, TAU/2);
Polar.negi = new Polar(1, 3 * TAU/4);
