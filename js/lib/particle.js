class Particle {
  // We could refactor particles to track only position and momentum.
  // That would actually be slightly more quantum-mechanical of us, and
  // slightly more efficient. However, classical potential functions sometimes
  // depend on mass (consider gravity), and it's nice to have all the possible
  // variables that a potential could depend on captured by the configuration
  // and the time.
  constructor (mass, position, velocity) {
    this._mass = mass;
    this._position = position;
    this._velocity = velocity;
  }

  get mass () { return this._mass; }
  get position () { return this._position; }
  get velocity () { return this._velocity; }

  // Calculated such that mass is proportional to area, and such that a unit
  // circle has a mass of 1.
  get radius () { return Circle2D.radius(this.mass); }

  perturb (dPosition, dVelocity = null) {
    return new Particle(
        this.mass,
        (dPosition == null) ? this.position : this.position.add(dPosition),
        (dVelocity == null) ? this.velocity : this.velocity.add(dVelocity));
  }

  relabel (position = this.position, velocity = this.velocity) {
    return new Particle(this.mass, position, velocity);
  }

  get T () {
    return 0.5 * this.mass * this.velocity.rSquared;
  }
}

class PolarParticle extends Particle {
  get T () {
    return 0.5 * this.mass * (this.velocity.rSquared + this.position.rSquared * this.velocity.theta**2);
  }
}
