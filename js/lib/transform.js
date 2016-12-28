class Matrix2x2 {
  constructor (row1, row2) {
    this._row1 = row1;
    this._row2 = row2;
  }

  static fromValues (a, b, c, d) {
    return new this(new Vector2(a, b), new Vector2(c, d));
  }
  static fromRows (first, second) {
    return new this(first, second);
  }
  static fromColumns (first, second) {
    return new this(new Vector2(first.x, second.x), new Vector2(first.y, second.y));
  }
  static rotation (theta, R = 1) {
    const Rcos = R * Math.cos(theta);
    const Rsin = R * Math.sin(theta);
    return this.fromValues(
        Rcos, Rsin,
        -Rsin, Rcos);
  }

  get a () { return this._row1.x; }
  get b () { return this._row1.y; }
  get c () { return this._row2.x; }
  get d () { return this._row2.y; }
  get T () {
    return new this.constructor(
        this._row1.x,
        this._row2.x,
        this._row1.y,
        this._row2.y);
  }
  get row1 () { return this._row1; }
  get row2 () { return this._row2; }
  get col1 () { return new Vector2(this._row1.x, this._row2.x); }
  get col2 () { return new Vector2(this._row1.y, this._row2.y); }
  get rows () { return [this.row1, this.row2]; }
  get cols () { return [this.row2, this.col2]; }
  get values () { return [...this.row1, ...this.row2]; }
  get det () { return sub(mul(this.a, this.d), mul(this.b, this.c)); }
  get inverse () {
    if (this._inverse == null) {
      const det = this.det;
      this._inverse = this.constructor.fromValues(
          over(this.d, det),
          -over(this.b, det),
          -over(this.c, det),
          over(this.a, det));
    }
    return this._inverse;
  }

  scale (scalar) {
    return this.constructor.fromRows(
        this._row1.scale(scalar),
        this._row2.scale(scalar));
  }

  over (scalar) {
    return this.constructor.fromRows(
        this._row1.over(scalar),
        this._row2.over(scalar));
  }

  equals (other) {
    return other._row1.equals(this._row1) && other._row2.equals(this._row2);
  }

  // Right now we only support multiplying by 2x2 matrices or vector2s.
  // Thus, we aren't implementing mul just yet, as that should be general.
  compose (matrix2x2) {
    return Matrix2x2.fromColumns(
        this.apply(matrix2x2.col1),
        this.apply(matrix2x2.col2));
  }
  apply (vector2) {
    return new Vector2(
        this.row1.dot(vector2),
        this.row2.dot(vector2));
  }

  flipY () {
    return new Matrix2x2(this._row1, this._row2.scale(-1));
  }
}

Matrix2x2.zero = Matrix2x2.fromRows(Vector2.zero, Vector2.zero);
Matrix2x2.I = Matrix2x2.fromRows(Vector2.unitX, Vector2.unitY);


class AffineTransform2 {
  constructor (M = Matrix2x2.I, b = Vector2.zero) {
    this.M = M;
    this.b = b;
    this.unM = M.inverse;
  }

  //  x -> Mx + b
  apply (vector2) { return this.M.apply(vector2).add(this.b); }
  // y -> M.inverse(y-b)
  reverse (vector2) { return this.unM.apply(vector2.sub(this.b)); }

  get inverse () {
    return new AffineTransform2(this.unM, this.unM.apply(this.b.negate()));
  }

  scale (scalar) {
    return new AffineTransform2(this.M.scale(scalar), this.b.scale(scalar));
  }

  over (scalar) {
    return new AffineTransform2(this.M.over(scalar), this.b.over(scalar));
  }

  add (vec2) {
    return new AffineTransform2(this.M, this.b.add(vec2));
  }

  compose (aff) {
    return new AffineTransform2(this.M.compose(aff.M), this.b.add(aff.b));
  }

  equals (aff) {
    return aff.M.equals(this.M) && aff.b.equals(this.b);
  }

  flipY () {
    return new AffineTransform2(this.M.flipY(), this.b);
  }

  withMatrix (M) { return new AffineTransform2(M, this.b); }
  withTranslation (b) { return new AffineTransform2(M, this.b); }

  static linear (M) { return new this(M, Vector2.zero); }
  static translation (b) { return new this(Matrix2x2.I, b); }
  static rotation (theta, R = 1) { return this.linear(Matrix2x2.rotation(theta, R)); }
  static scale (x, y = null) {
    return this.linear(Matrix2x2.fromRows(
        Vector2.unitX.scale(x),
        Vector2.unitY.scale(y == null ? x : y)));
  }
}

AffineTransform2.trivial = new AffineTransform2();
