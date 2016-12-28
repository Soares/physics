class Shape2D {
  constructor (lineWidth, boundingRect) {
    this.lineWidth = lineWidth;
    this.boundingRect = boundingRect;
  }

  borderWidth (bounds) { return this.lineWidth; }

  paint (context) { throw NotImplemented; }

  shouldDraw (bounds) {
    return this.constructor.shouldDraw(
        this.boundingRect,
        bounds,
        this.borderWidth(bounds));
  }

  draw (context, bounds, stroke = 'black', fill = false) {
    if (this.shouldDraw(bounds)) {
      context.save();
      context.beginPath();
      if (stroke) { context.strokeStyle = stroke; }
      if (fill) { context.fillStyle = fill; }
      context.lineWidth = this.lineWidth;
      this.paint(context);
      if (stroke) { context.stroke(); }
      if (fill) { context.fill(); }
      context.restore();
    }
  }

  static shouldDraw (rect1, rect2 = null, wiggleRoom = 0) {
    if (rect1 == null || rect2 == null) { return true; }
    return rect2.roughlyIntersectsRect(rect1, wiggleRoom);
  }
}


class LineSegment2D extends Shape2D {
  // start and end are Vector2s.
  constructor (start, delta, lineWidth = 0) {
    super(lineWidth, LineSegment2D.boundsFor(start, start.add(delta)));
    this.start = start;
    this.delta = delta;
  }

  static fromEndPoints (start, end, lineWidth = 0) {
    return new this(start, end.sub(start), lineWidth);
  }

  get end () { return this.start.add(this.delta); }

  paint (context) {
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
  }

  static boundsFor (start, end) {
    return Bounds.ltrb(
        Math.min(start.x, end.x),
        Math.min(start.y, end.y),
        Math.max(start.x, end.x),
        Math.max(start.y, end.y));
  }
}

class Circle2D extends Shape2D {
  // center is a Vector2.
  constructor (center, radius, lineWidth = 0) {
    super(lineWidth, Circle2D.boundsFor(center, radius));
    this.center = center;
    this.radius = radius;
  }

  paint (context) {
    context.arc(this.center.x, this.center.y, this.radius, 0, TAU);
  }

  static boundsFor (center, radius) {
    return new Bounds(
        center.y - radius,
        center.x - radius,
        2 * radius,
        2 * radius);
  }

  static area (radius) { return TAU/2 * (radius**2); }
  static radius (area) { return Math.sqrt(area * 2 / TAU); }
}

class Arrow2D extends LineSegment2D {
  constructor (start, delta, lineWidth = 5, capFactor = 2, capAngle = TAU/12) {
    super(start, delta, lineWidth);
    this.capFactor = capFactor;
    this.capAngle = capAngle;
    this.capSize = Math.min(this.lineWidth * this.capFactor, this.delta.r);
  }

  draw (context, bounds, style) {
    if (this.shouldDraw(bounds, this.borderWidth(bounds))) {
      this.paint(context, style);
    }
  }

  paintLine (context) {
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(
        this.end.x -
        this.capSize * Math.cos(this.capAngle) * Math.cos(this.delta.theta),
        this.end.y -
        this.capSize * Math.cos(this.capAngle) * Math.sin(this.delta.theta));
  }

  paintCap (context) {
    context.moveTo(this.end.x, this.end.y);
    context.lineTo(
        this.end.x - this.capSize * Math.cos(this.delta.theta - this.capAngle),
        this.end.y - this.capSize * Math.sin(this.delta.theta - this.capAngle));
    context.lineTo(
        this.end.x - this.capSize * Math.cos(this.delta.theta + this.capAngle),
        this.end.y - this.capSize * Math.sin(this.delta.theta + this.capAngle));
    context.lineTo(this.end.x, this.end.y);
  }

  paint (context, style) {
    context.save();
    context.beginPath();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = style;
    this.paintLine(context);
    context.lineCap = 'round';
    context.stroke();

    context.beginPath();
    context.lineWidth = 0;
    context.fillStyle = context.strokeStyle;
    this.paintCap(context);
    context.fill();
    context.restore();
  }

  static drawAll (arrows, context, bounds, style, lineWidth = 5) {
    context.save();
    context.beginPath();

    context.lineWidth = lineWidth;
    context.strokeStyle = style;
    context.lineCap = 'round';
    arrows.forEach((a) => { if (a.shouldDraw(bounds)) { a.paintLine(context) } });
    context.stroke();

    context.lineWidth = 0;
    context.fillStyle = context.strokeStyle;
    arrows.forEach((a) => { if (a.shouldDraw(bounds)) { a.paintCap(context) } });
    context.fill();

    context.restore();
  }
}

class Grid2D {
  constructor (center, unitX, unitY, lineWidth) {
    this.center = center;
    this.unitX = unitX;
    this.unitY = unitY;
    this.lineWidth = lineWidth;
  }

  draw (context, bounds, strokeStyle) {
    context.beginPath();
    context.strokeStyle = strokeStyle;
    context.lineWidth = this.lineWidth;

    // Drawing a linearly transformed grid is kinda frickin' annoying, mainly
    // because of how it interacts with the bounding box.
    // The code duplication here sucks, but the below thing is non-trivial to
    // abstract.  I would have to think hard about how to do the transformation
    // and get the right bounds, and I don't have the time for that.

    // This is a hack. The thing it's avoiding is a skewed thick line being
    // drawn right up againts a boundary, such that the end of the line can be
    // seen inside the bounding rectangle. Thus, the actual bounding rectangle
    // we use is enlargened by 10x the lineWidth. This is good enough in
    // practice, but could lead to unsightly grids if the lines are both wide
    // and skewed.
    const top = bounds.top - 10 * this.lineWidth;
    const left = bounds.left - 10 * this.lineWidth;
    const bottom = bounds.bottom + 10 * this.lineWidth;
    const right = bounds.right + 10 * this.lineWidth;

    // Ideally, at least one unit vector has x-dimension and one has y-dimension.
    // Let's make sure that if that's the case, this.unitX has the x and this.unitY has the y.
    if (isRealSmall(this.unitX.x) || isRealSmall(this.unitY.y)) {
      [this.unitX, this.unitY] = [this.unitY, this.unitX];
    }

    // convenience function
    const line = (start, end) => {
      const segment = LineSegment2D.fromEndPoints(start, end, this.lineWidth);
      if (segment.shouldDraw(bounds)) {
        segment.paint(context);
      }
    };

    // First we draw a bunch of this.unitY-directed rays each shifted right by
    // this.unitX. Then we draw a bunch of this.unitX-directed rays each
    // shifted up by this.unitY.

    if (isRealSmall(this.unitY.y)) {
      // If the this.unitY-directed rays are horizontal, then shifting them right
      // does nothing, so we just draw the one.
      if (this.unitY.x != 0) {
        line(new Vector2(left, this.center.y), new Vector2(right, this.center.y));
      }
    } else {
      // This problem is annoying because we must both (a) ensure that one of
      // the lines goes through the this.center, and (b) draw enough lines to fill
      // in the corners even if the axes are really really skewed.
      // Here's what we do. We start at the this.center, and then shift up and down
      // to get the top and bottom intercepts. Then we're going to draw lines
      // rightward from the top intercept (until the top falls off the right
      // edge), and leftwards from the bottom intercept (until the bottom falls
      // off the left edge), thus ensuring that we've drawn all the lines
      // regardless of how skewed the axes are.
      const toTop = this.unitY.scale((top - this.center.y) / this.unitY.y);
      const toBottom = this.unitY.scale((bottom - this.center.y) / this.unitY.y);
      const topIntercept = this.center.add(toTop);
      const bottomIntercept = this.center.add(toBottom);
      const lineMotion = bottomIntercept.sub(topIntercept);
      // We'll shift each line by first adding this.unitX, and then shifting back up
      // to the horizontal on which the this.center lies.
      const shift = this.unitX.sub(this.unitY.scale(this.unitX.y / this.unitY.y));
      const positiveStep = (shift.x > 0) ? shift : shift.negate();
      // This is the line that goes through the this.center.
      line(topIntercept, bottomIntercept);
      // If positiveStep is zero, then the this.unitX points in the same direction
      // as this.unitY, so stepping does not shift the ray, and we don't need to
      // draw any more lines.
      if (positiveStep.x > 0) {
        // Screw it, the logicl is complicated, just write lots of lines both
        // ways. We'll optimize later if the grid is slowing things down.
        const numLines = Math.max(
          topIntercept.x - left,
          bottomIntercept.x - left,
          right - topIntercept.x,
          right - bottomIntercept.x) / positiveStep.x;
        for (let i = 1; i <= numLines; i++) {
          const middle = this.center.sub(shift.scale(i));
          line(middle.add(toTop), middle.add(toBottom));
        }
        for (let i = 1; i <= numLines; i++) {
          const middle = this.center.add(shift.scale(i));
          line(middle.add(toTop), middle.add(toBottom));
        }
      }
    }

    // This code is essentially the same as the above code, flipped a quarter-turn.
    // Apologies for the duplication; this is non-trivial to abstract (mainly
    // because of the dependence on the bounding box).
    if (isRealSmall(this.unitX.x)) {
      if (!isRealSmall(this.unitX.y)) {
        line(new Vector2(this.center.x, top), new Vector2(this.center.x, bottom));
      }
    } else {
      const toLeft = this.unitX.scale((left - this.center.x) / this.unitX.x);
      const toRight = this.unitX.scale((right - this.center.x) / this.unitX.x);
      const leftIntercept = this.center.add(toLeft);
      const rightIntercept = this.center.add(toRight);
      const shift = this.unitY.sub(this.unitX.scale(this.unitY.x / this.unitX.x));
      const positiveStep = (shift.y > 0) ? shift : shift.negate();
      line(leftIntercept, rightIntercept);
      if (positiveStep.y > 0) {
        const numLines = Math.max(
            leftIntercept.y - top,
            rightIntercept.y - top,
            bottom - leftIntercept.y,
            bottom - rightIntercept.y) / positiveStep.y;
        for (let i = 1; i <= numLines; i++) {
          const middle = this.center.sub(shift.scale(i));
          line(middle.add(toLeft), middle.add(toRight));
        }
        for (let i = 1; i <= numLines; i++) {
          const middle = this.center.add(shift.scale(i));
          line(middle.add(toLeft), middle.add(toRight));
        }
      }
    }

    context.stroke();
    context.restore();
  }
}

class Axes2D {
  constructor (center, unitX, unitY, lineWidth, tickHeight) {
    this.center = center;
    this.unitX = unitX;
    this.unitY = unitY;
    this.lineWidth = lineWidth;
    this.tickHeight = tickHeight;
  }

  draw (context, bounds, strokeStyle) {
    context.save();
    context.beginPath();
    context.strokeStyle = strokeStyle;
    context.lineWidth = this.lineWidth;

    // This code is essentially the same as the drawGrid code, modified to draw
    // axes with ticks instead of a grid.
    // Again, apologies for the duplication. It doesn't abstract easily (thanks
    // to the dependence on the bounding box), and I don't have the time to
    // abstract it properly.

    const top = bounds.top - 10 * this.lineWidth;
    const left = bounds.left - 10 * this.lineWidth;
    const bottom = bounds.bottom + 10 * this.lineWidth;
    const right = bounds.right + 10 * this.lineWidth;

    if (isRealSmall(this.unitX.x) || isRealSmall(this.unitY.y)) {
      [this.unitX, this.unitY] = [this.unitY, this.unitX];
    }

    const line = (start, end) => {
      const segment = LineSegment2D.fromEndPoints(start, end, this.lineWidth);
      if (segment.shouldDraw(bounds)) {
        segment.paint(context);
      }
    };

    if (isRealSmall(this.unitY.y)) {
      if (!isRealSmall(this.unitY.x)) {
        line(new Vector2(left, this.center.y), new Vector2(right, this.center.y));
      }
    } else {
      const toTop = this.unitY.scale((top - this.center.y) / this.unitY.y);
      const toBottom = this.unitY.scale((bottom - this.center.y) / this.unitY.y);
      const topIntercept = this.center.add(toTop);
      const bottomIntercept = this.center.add(toBottom);
      line(topIntercept, bottomIntercept);
      const orthogonal = this.unitX.normalize();
      const upHalfTick = orthogonal.scale(this.tickHeight / 2);
      if (upHalfTick.r > this.lineWidth / 2) {
        const downTick = orthogonal.scale(-this.tickHeight);
        const nextTickMotion = this.unitY.y > 0 ? this.unitY : this.unitY.negate();
        let varyingTick = this.center;
        while (varyingTick.y > topIntercept.y) {
          varyingTick = varyingTick.sub(nextTickMotion);
          line(varyingTick.add(upHalfTick), varyingTick.sub(upHalfTick));
        }
        varyingTick = this.center;
        while (varyingTick.y < bottomIntercept.y) {
          varyingTick = varyingTick.add(nextTickMotion);
          line(varyingTick.add(upHalfTick), varyingTick.sub(upHalfTick));
        }
      }
    }

    if (isRealSmall(this.unitX.x)) {
      if (!isRealSmall(this.unitX.y)) {
        line(new Vector2(this.center.x, top), new Vector2(this.center.x, bottom));
      }
    } else {
      const toLeft = this.unitX.scale((left - this.center.x) / this.unitX.x);
      const toRight = this.unitX.scale((right - this.center.x) / this.unitX.x);
      const leftIntercept = this.center.add(toLeft);
      const rightIntercept = this.center.add(toRight);
      line(leftIntercept, rightIntercept);
      const orthogonal = this.unitY.normalize();
      const upHalfTick = orthogonal.scale(this.tickHeight / 2);
      if (upHalfTick.r > this.lineWidth / 2) {
        const downTick = orthogonal.scale(-this.tickHeight);
        const nextTickMotion = this.unitX.x > 0 ? this.unitX : this.unitX.negate();
        let varyingTick = this.center;
        while (varyingTick.x > leftIntercept.x) {
          varyingTick = varyingTick.sub(nextTickMotion);
          line(varyingTick.add(upHalfTick), varyingTick.sub(upHalfTick));
        }
        varyingTick = this.center;
        while (varyingTick.x < rightIntercept.x) {
          varyingTick = varyingTick.add(nextTickMotion);
          line(varyingTick.add(upHalfTick), varyingTick.sub(upHalfTick));
        }
      }
    }

    context.stroke();
    context.restore();
  }
}
