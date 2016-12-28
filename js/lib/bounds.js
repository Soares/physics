class Bounds {
  constructor (left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  static ltrb (left, top, right, bottom) {
    return new this(left, top, right - left, bottom - top);
  }

  get right () { return this.left + this.width; }
  get bottom () { return this.top + this.height; }

  roughlyIntersectsRect (other, wiggleRoom = 0) {
    return (this.left - wiggleRoom) < other.right &&
      (this.right + wiggleRoom) > other.left &&
      (this.top - wiggleRoom) < other.bottom &&
      (this.bottom + wiggleRoom) > other.top;
  }
}
