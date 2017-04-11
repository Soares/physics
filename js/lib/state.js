class C {
  constructor (re=1, im=0) {
      this.re = re;
      this.im = im;
  }

  static rtheta (r, theta) { return new C(r * Math.cos(theta), r * Math.sin(theta)); }
  static apib (x, y) { return new C(x, y); }
  static zero () { return new C(0, 0); }
  static one (mag=1) { return new C(mag, 0); }
  static i (mag=1) { return new C(0, mag); }
  static expi (theta=0, r=1) { return C.rtheta(r, theta); }
  static parse (str) {  // C.parse("2 + 3i")
    str += '';  // convert to str.

    const repart = /([+-]?)\s*(\d+(\.\d+)?)([^i].*|$)/;
    const rematch = str.match(repart);
    let re;
    if (rematch == null) {
      re = 0;
    } else {
      const [_total, resign, renum, _redecimal, rest] = rematch;
      str = rest;
      re = Number.parseFloat((resign == undefined ? '' : resign) + renum);
    }

    const impart = /([+-])?\s*(\d+(\.\d+)?)?i/;
    const immatch = str.match(impart);
    let im;
    if (immatch == null) {
      im = 0;
    } else {
      const [_total, imsign, imnum, _imdecimal] = immatch;
      im = Number.parseFloat(
          (imsign == undefined ? '' : imsign) +
          (imnum == undefined ? 1 : imnum));
    }

    return new C(re, im);
  }

  get r () { return Math.hypot(this.re, this.im); }
  get theta () { return Math.atan2(this.im, this.re); }
  get rSquared () { return this.re**2 + this.im**2; }

  clone () {
    return new C(this.re, this.im);
  }

  imitate (other) {
    this.re = other.re;
    this.im = other.im;
    return this;
  }

  conjugate () {
    this.im = -this.im;
    return this;
  }

  mul (other) {
    [this.re, this.im] = [
      (this.re * other.re) - (this.im * other.im),
      (this.re * other.im) + (this.im * other.re)];
    return this;
  }

  add (other) {
    this.re += other.re;
    this.im += other.im;
    return this;
  }

  negate () {
    this.re = -this.re;
    this.im = -this.im;
    return this;
  }

  reciprocate () {
    const det = this.rSquared;
    this.re /= det;
    this.im /= -det;
    return this;
  }

  div (other) {
    const odet = other.rSquared;
    const ore = other.re / odet;
    const oim = other.im / -odet;
    [this.re, this.im] = [
      (this.re * ore) - (this.im * oim),
      (this.re * oim) + (this.im * ore)];
    return this;
  }

  sub (other) {
    this.re -= other.re;
    this.im -= other.im;
    return this;
  }

  equals (other) {
    return this.re == other.re && this.im == other.im;
  }

  normalize () {
    const r = this.r;
    this.re /= r;
    this.im /= r;
    return this;
  }

  // For convenience:
  rotate (theta) {
    const cos = Math.cos(theta), sin = Math.sin(theta);
    [this.re, this.im] = [
      (this.re * cos) - (this.im * sin),
      (this.re * sin) + (this.im * cos)];
    return this;
  }

  stretch (real) {  // not named .scale b/c I expected to forget that the arg was real rather than complex.
    this.re *= real;
    this.im *= real;
    return this;
  }

  toString () {
    if (this.im == 0) {
      return this.re + '';
    } else if (this.im > 0) {
      return (this.re == 0 ? '' : this.re + '+') + (this.im == 1 ? '' : this.im) + 'i';
    } else {
      return (this.re == 0 ? '' : this.re) + '-' + (this.im == -1 ? '' : -this.im) + 'i';
    }
  }
}


class CVector {
  constructor (carray) {  // I suggest using the static methods to make this.
    this.carray = carray;
  }

  static fromCs (...cs) {
    return this.fromArray(cs);
  }

  static fromArray (cs) {
    return new CVector(CVector._carray(cs));
  }

  static _carray (array) {
    const carray = new complex_array.ComplexArray(array.length);
    carray.map((c, i) => {
      c.real = array[i].re;
      c.imag = array[i].im;
    });
    return carray;
  }

  get dim () { return this.carray.length; }
  at (i) { return new C(this.carray.real[i], this.carray.imag[i]); }

  mapInPlace (f) {
    this.carray.mapC((c, i, dim) => f(c, i, dim));
    return this;
  }

  map (f) {  // note that you get the same C object each iteration.
    const result = [];
    this.carray.forEachC((c, i, dim) => result.push(f(c, i, dim)));
  }

  _args () {
    return [];
  }

  clone () {
    return new this.constructor(
        new complex_array.ComplexArray(this.carray), ...this._args());
  }

  imitate (other) {
    this.carray = other.carray;
    return this;
  }

  add (other) {
    this.carray.map((c, i) => {
      c.real += other.carray.real[i];
      c.imag += other.carray.imag[i];
    });
    return this;
  }

  sub (other) {
    this.carray.map((c, i) => {
      c.real -= other.carray.real[i];
      c.imag -= other.carray.imag[i];
    });
    return this;
  }

  scale (scalar) {
    this.carray.map((c) => {
      [c.real, c.imag] = [
        (c.real * scalar.re) - (c.imag * scalar.im),
        (c.real * scalar.im) + (c.imag * scalar.re)];
    });
    return this;
  }

  stretch (real) {
    this.carray.map((c) => {
      c.real *= real;
      c.imag *= real;
    });
    return this;
  }

  conjugate () {
    this.carray.conjugate();
    return this;
  }

  dot (other) {
    let total = C.zero();
    for (let i = 0; i < this.dim; i++) {
      total.re += (this.carray.real[i] * other.carray.real[i]) - (this.carray.imag[i] * other.carray.imag[i]);
      total.im += (this.carray.real[i] * other.carray.imag[i]) + (this.carray.imag[i] * other.carray.real[i]);
    }
    return total;
  }

  innerProduct (other) {
    // x.innerProduct(y) is ⟨x|y⟩
    let total = C.zero();
    for (let i = 0; i < this.dim; i++) {
      total.re += (this.carray.real[i] * other.carray.real[i]) + (this.carray.imag[i] * other.carray.imag[i]);
      total.im += (this.carray.real[i] * other.carray.imag[i]) - (this.carray.imag[i] * other.carray.real[i]);
    }
    return total;
  }

  magSquared () {  // Real number (unlike x.innerProduct(x), which is a C)
    let total = 0;
    for (let i = 0; i < this.dim; i++) {
      total += this.carray.real[i]**2 + this.carray.imag[i]**2;
    }
    return total;
  }

  mag () {
    return Math.sqrt(this.magSquared());
  }

  normalize () {
    this.stretch(1 / this.mag());
    return this;
  }

  ft (invert=false) {
    this.carray[invert ? 'InvFFT' : 'FFT']();
    return this;
  }

  evolve (U, dt, epsilon=1e-3) {
    const numSteps = Math.floor(Math.abs(dt) / epsilon);
    const stepDirection = Math.sign(dt);
    const delta = stepDirection * epsilon;
    for (let step = 0; step < numSteps; step++) {
      U(this, delta);
    }
    const leftover = dt - (numSteps * delta);
    if (leftover > Number.EPSILON) {
      U(this, leftover);
    }
    return this;
  }

  magSquared () {
    let magsq = 0;
    for (let i = 0; i < this.dim; i++) {
      magsq += this.carray.real[i]**2 + this.carray.imag[i]**2;
    }
    return magsq;
  }

  normalize () {
    const recipmag = 1 / Math.sqrt(this.magSquared());
    for (let i = 0; i < this.dim; i++) {
      this.carray.real[i] *= recipmag;
      this.carray.imag[i] *= recipmag;
    }
    return this;
  }

  reduce (f, x=C.zero()) {
    for (let i = 0; i < this.dim; i++) {
      x = f(x, new C(this.carray.real[i], this.carray.imag[i]));
    }
    return x;
  }

  transform (operator) {
    // Inefficient (it's merely faking being in-place).
    this.carray = CVector._carray(operator.rows.map((row) => row.dot(this)));
    return this;
  }

  rightmul (operator) {
    // ψ.rightmul(A) is ⟨ψ|A
    this.conjugate();
    this.carray = CVector._carray(operator.cols.map((col) => this.dot(row)));
  }

  E (operator) {
    return this.innerProduct(operator.apply(this));
  }

  uncertainty (operator) {
    const E = this.E(operator);
    const Esq = this.E(operator.clone().compose(operator));
    return Esq - E;
  }

  toString () {
    return '[' + this.map((c) => c.toString()).join(', ') + ']';
  }
}


class Operator {  // Square Hermetian matrix.
  constructor (rows) {
    this.rows = rows;
    this.width = rows.length;
  }

  get cols () {
    const columns = [];
    for (let i = 0; i < this.width; i++) {
      columns.push(new Array(this.width));
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.width; j++) {
        columns[i][j] = this.rows[i].at(j);
      }
    }
    for (let i = 0; i < this.width; i++) {
      columns[i] = CVector.fromArray(columns[i]);
    }
    return columns;
  }

  static fromRows (rows) {
    return new Operator(rows.map((row) => CVector.fromArray(row)));
  }

  static fromColumns (cols) {
    return new Operator(cols).transpose();
  }

  static hermetian (hermetian) {
    const rows = [];
    const width = hermetian.length;
    for (let i = 0; i < width; i++) {
      rows.push([]);
      for (let j = 0; j < width; j++) {
        if (j < i) {
          rows[i][j] = hermetian[j][i - j].clone().conjugate();
        } else {
          rows[i][j] = hermetian[i][j - i];
        }
      }
    }
    return Operator.fromRows(rows);
  };

  static I (length) {
    const rows = [];
    for (let i = 0; i < length; i++) {
      const row = [];
      for (let j = 0; j < length; j++) {
        row.push( (j == i) ? C.one() : C.zero() );
      }
      rows.push(row);
    }
    return Operator.fromRows(rows);
  }

  prod (other) {
    const newRows = [];
    for (let i = 0; i < this.width * other.width; i++) {
      newRows.push(new Array(this.width * other.width));
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.width; j++) {
        for (let k = 0; k < other.width; k++) {
          for (let l = 0; l < other.width; l++) {
            newRows[ (other.width * i) + k ][ (other.width * j) + l ] =
              this.rows[i].at(j).mul(other.rows[k].at(l));
          }
        }
      }
    }
    return Operator.fromRows(newRows);
  }

  conjugate () {
    this.rows.map((row) => row.conjugate());
    return this;
  }

  transpose () {
    this.rows = this.cols;
    return this;
  }

  dagger () {
    this.transpose();
    this.conjugate();
    return this;
  }

  stretch (real) {
    this.rows.map((row) => row.stretch(real));
    return this;
  }

  scale (scalar) {
    this.rows.map((row) => row.scale(scalar));
    return this;
  }

  add (operator) {
    this.rows.map((row, i) => row.add(operator.rows[i]));
    return this;
  }

  clone () {
    return new Operator(this.rows.map((row) => row.clone()));
  }

  compose (other) {
    this.rows = other.cols.map(
        (col) => CVector.fromArray(this.rows.map((row) => row.dot(col))));
    return this;
  }

  apply (psi) {
    return CVector.fromArray(this.rows.map((row) => row.dot(psi)));
  }

  toString () {
    return this.rows.map((row) => row.toString()).join('\n');
  }
}


const I = Operator.I;
const sigmaZ = Operator.fromRows([
    [C.one(),   C.zero()],
    [C.zero(), C.one(-1)],
]);
const sigmaX = Operator.fromRows([
    [C.zero(),  C.one()],
    [C.one(),  C.zero()],
]);
const sigmaY = Operator.fromRows([
    [C.zero(),  C.i(-1)],
    [C.i(),    C.zero()],
]);
const UDtoRL = Operator.fromRows([
    [C.one(RROOT2), C.one(RROOT2)],
    [C.one(RROOT2), C.one(-RROOT2)],
]);
const UDtoIO = Operator.fromRows([
    [C.one(RROOT2), C.i(RROOT2)],
    [C.one(RROOT2), C.i(-RROOT2)],
]);


class FVector extends CVector {
  constructor (carray, start, stop, step) {
    // Recommendation: use fromCs or fromFunction.
    super(carray);
    this.start = start;
    this.stop = stop;
    this.step = step;
  }

  static fromCs (cs, {start=0, stop=cs.length, normalize=false} = {}) {
    const step = (stop - start) / (cs.length - 1);
    const vec = new FVector(CVector._carray(cs), start, stop, step);
    if (normalize) {
      vec.normalize();
    }
    return vec;
  }

  static fromFunction (f, start, stop, step=1) {
    const count = Math.floor((stop - start) / step);
    const carray = new complex_array.ComplexArray(count + 1);
    carray.map((c, i) => {
      const fx = f(start + (i * step));
      c.real = fx.re;
      c.imag = fx.im;
    });
    return new FVector(carray, start, stop, step);
  }

  _args () {
    return [this.start, this.stop, this.step];
  }

  x (i) { return this.start + (this.step * i); }

  X () {
    for (let i = 0; i < this.dim; i++) {
      const x = this.x(i);
      this.carray.real[i] *= x;
      this.carray.imag[i] *= x;
    }
    return this;
  }

  D () {
    const recipunit = 1 / this.step;
    const firstre = this.carray.real[0];
    const firstim = this.carray.real[0];
    const lasti = this.dim - 1;
    let prevre = this.carray.real[lasti];
    let previm = this.carray.imag[lasti];
    for (let i = 0; i <= lasti; i++) {
      const nextre = (i < lasti) ? this.carray.real[i + 1] : firstre;
      const nextim = (i < lasti) ? this.carray.imag[i + 1] : firstim;
      [this.carray.real[i], prevre] = [
        ((nextre - prevre) * recipunit * 0.5), this.carray.real[i]];
      [this.carray.imag[i], previm] = [
        ((nextim - previm) * recipunit * 0.5), this.carray.imag[i]];
    }
    return this;
  }

  P (hbar=(HBAR == undefined ? 1 : HBAR)) {
    // more efficient version of x.D().scale(C.i(-1))
    const recipunit = 1 / this.step;
    const firstre = this.carray.real[0];
    const firstim = this.carray.real[0];
    const lasti = this.dim - 1;
    let prevre = this.carray.real[lasti];
    let previm = this.carray.imag[lasti];
    for (let i = 0; i <= lasti; i++) {
      const nextre = (i < lasti) ? this.carray.real[i + 1] : firstre;
      const nextim = (i < lasti) ? this.carray.imag[i + 1] : firstim;
      [this.carray.real[i], this.carray.imag[i], prevre, previm] = [
        ((nextim - previm) * recipunit * 0.5),
        ((prevre - nextre) * recipunit * 0.5),
        this.carray.real[i],
        this.carray.imag[i],
      ];
    };
    return this;
  }
}
