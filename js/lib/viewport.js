class Viewport {
  constructor ({
    // Linear transformation to apply before rendering.
    // Should transform world coordinates into canvas coordinates.
    // May be a function of time and of the canvas center.
    transform = null,
    drawVelocityArrows = true,
    backgroundObjects = [],
    leaveTrails = false,
  } = {}) {
    this.setTransform(transform)
        .setDrawVelocityArrows(drawVelocityArrows)
        .setLeaveTrails(leaveTrails);
    this.backgroundObjects = backgroundObjects;
    this.userTransform = AffineTransform2.trivial;
    this.backgroundObjects = backgroundObjects;
  }


  getTransform (worldTime, canvasCenter) {
    const worldTransform = this._transform instanceof Function ?
      this._transform(worldTime) :
      this._transform;
    // This is precisely the order such that the programatic transform is given
    // in world coordinates.
    return new AffineTransform2(
        this.userTransform.M.compose(worldTransform.M),
        this.userTransform.M.apply(worldTransform.b)
          .add(this.userTransform.b).add(canvasCenter));
  }

  // If this is made to vary by particle, then the (optimized) arrow drawing
  // method must be updated.
  get velocityArrowColor () { return 'rgba(0, 0, 0, 0.5)'; }
  massColorToStrokeStyle(color) { return false; }
  massColorToFillStyle(color) { return color; }

  draw (context, world, bounds, canvasCenter) {
    // We draw things like grids and arrows in canvas-space, because their
    // widths don't vary with the scaling of the world.
    // We draw the actual objects -- in this case, ellipsed -- by transforming
    // the canvas into world-space, drawing circles, and transforming back.
    // This saves us from transforming the circles into ellipses ourselves.

    const worldToCanvas = this.getTransform(world.time, canvasCenter);
    const particles = world.particles;
    const params = {
      origin: worldToCanvas.b,
      unitX: worldToCanvas.M.apply(Vector2.unitX),
      unitY: worldToCanvas.M.apply(Vector2.unitY),
      bounds:  bounds,
      time: world.time,
      canvasCenter: canvasCenter,
      translatePoint: (pt) => worldToCanvas.apply(pt),
      translateVector: (vec) => worldToCanvas.M.apply(vec),
    };

    this.backgroundObjects.forEach((bo) => bo.draw(context, params));

    // This is still somewhat buggy given complex transforms.
    context.save();
    context.transform(
        params.unitX.x,
        params.unitX.y,
        params.unitY.x,
        params.unitY.y,
        params.origin.x,
        params.origin.y);
    particles.forEach((particle, i) => {
      // We check bounds in the untranslated space, because that's where we
      // have the bounds object.
      const canvasCenter = params.translatePoint(particle.position);
      const canvasR = particle.radius * Math.max(params.unitX.r, params.unitY.r);
      const particleBounds = Circle2D.boundsFor(canvasCenter, canvasR);
      if (Shape2D.shouldDraw(particleBounds, this.bounds)) {
        new Circle2D(particle.position, particle.radius).draw(
            context,
            null,
            this.massColorToStrokeStyle(world.trajectories[i].color), 
            this.massColorToFillStyle(world.trajectories[i].color));
      }
    });
    context.restore();

    if (this.drawVelocityArrows) {
      // Drawing the velocity arrows is one of our most expensive operations.
      // b/c of how canvas works, we can optimize by drawing all lines and then
      // drawing all caps (assuming all velocity arrows have the same color and
      // line width).
      const arrows = particles.map((particle) => {
        const center = params.translatePoint(particle.position);
        const delta = params.translateVector(particle.velocity);
        return new Arrow2D(center, delta);
      });
      Arrow2D.drawAll(arrows, context, this.bounds, this.velocityArrowColor, 5);
    }
  }

  setTransform (transform) {
    if (transform == null) {
      transform = [1, 1];
    }
    if (typeof transform == typeof 0) {
      transform = [transform, transform];
    }
    if (transform instanceof Array) {
      const [scaleX, scaleY] = transform;
      transform = (t, o) => new AffineTransform2(
          new Matrix2x2(
            Vector2.unitX.scale(scaleX),
            Vector2.unitY.scale(scaleY)),
          o);
    }
    this._transform = transform;
    return this;
  }

  setDrawVelocityArrows (value = true) {
    this.drawVelocityArrows = value;
    return this;
  }

  setLeaveTrails (value = true) {
    this.leaveTrails = value;
    return this;
  }

  add (object) {
    this.backgroundObjects.push(object);
    return this;
  }
}
