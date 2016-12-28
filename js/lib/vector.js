class Vector extends Coordinate {
  constructor (values) {
    super();
    // Postmature optimization. Vector2 needs to be able to do this w/out
    // arrays, b/c it's very hot.
    if (values != null) { this._values = values; }
  }

  get values () { return this._values; }

  // The (Euclidian, l2) norm of the coordinate.
  get norm () { return Math.sqrt(this.normSquared); }

  // The squared (Euclidian, l2) norm of the coordinate.
  get normSquared () { return sum(this.values, (v) => v**2); }

  normalize () { return this.over(this.norm); }

  mul (other) { return this.dot(other); }

  dot (other) { return sum(zip(mul, this.values, other.values)); }
}


class Vector1 extends Vector {
  constructor(x) { super(null); this._x = x; }
  get values () { return [this._x]; }
  get dimension () { return 1; }
  get x () { return this._x; }

  get _canMutate () { return true; }
  _shift (i, delta) { this._x += delta; }

  // Re-implemented for the purpose of making error messages nicer.
  get norm () { return this.x; }
  get normSquared () { return this.x ** 2; }
  add (other) { return new this.constructor(add(this.x, other.x)); }
  sub (other) { return new this.constructor(sub(this.x, other.x)); }
  scale (scalar) { return new this.constructor(scale(this.x, scalar)); }
  over (scalar) { return new this.constructor(over(this.x, scalar)); }
  dot (other) { return new this.constructor(mul(this.x, other.x)); }

  static fill (value) { return new Vector1(value); }
}

Vector1.zero = Vector1.fill(0);
Vector1.unit = Vector1.fill(1);


class Vector2 extends Vector {
  constructor (x, y) { super(null); this._x = x; this._y = y; }
  get values () { return [this._x, this._y]; }
  get dimension () { return 2; }

  get _canMutate () { return true; }
  _shift (i, delta) {
    if (i == 0) { this._x += delta; }
    else { this._y += delta; }
  }

  get x () { return this._x; }
  get y () { return this._y; }
  get r () { return this.norm; }
  get rSquared () { return this.normSquared; }
  get theta () { return Math.atan2(this.y, this.x); }

  orthogonal () { return new Vector2(-this.y, this.x); }
  extend (r) { return Vector2.polar(this.r + r, this.theta); }
  rotate (theta) { return Vector2.polar(this.r, this.theta + theta); }
  complexMul (other) {
    return Vector2.polar(this.r * other.r, this.theta + other.theta);
  }

  // Re-implemented for the purpose of making error messages nicer.
  get normSquared () {
    return this.dot(this);
  }
  add (other) {
    // Postmature optimization. This function is hot.
    if (typeof this._x == 'number') {
      return new Vector2(this._x + other._x, this._y + other._y);
    }
    return new Vector2(add(this.x, other.x), add(this.y, other.y));
  }
  sub (other) {
    // Postmature optimization. This function is hot.
    if (typeof this._x == 'number') {
      return new Vector2(this._x - other._x, this._y - other._y);
    }
    return new Vector2(sub(this.x, other.x), sub(this.y, other.y));
  }
  scale (scalar) {
    // Postmature optimization. This function is hot.
    if (typeof this._x == 'number') {
      return new Vector2(this._x * scalar, this._y * scalar);
    }
    return new Vector2(mul(this.x, scalar), mul(this.y, scalar));
  }
  over (scalar) {
    // Postmature optimization. This function is hot.
    if (typeof this._x == 'number') {
      return new Vector2(this._x / scalar, this._y / scalar);
    }
    return new Vector2(over(this.x, scalar), over(this.y, scalar));
  }
  dot (other) {
    return add(mul(this.x, other.x), mul(this.y, other.y));
  }

  equals (other) {
    return other._x == this._x && other._y == this._y;
  }

  cross (other) {
    return sub(mul(this.x, other.y), mul(this.y, other.x));
  }

  static polar (r, theta) {
    return new this(r * Math.cos(theta), r * Math.sin(theta));
  }
  static fill (value) { return new this(value, value); }
  static unit (i, zero = 0, one = 1) {
    return new this(i == 0 ? one : zero, i == 1 ? one : zero);
  }
}

Vector2.zero = Vector2.fill(0);
Vector2.unitX = Vector2.unit(0);
Vector2.unitY = Vector2.unit(1);
Vector2.one = Vector2.fill(1);
