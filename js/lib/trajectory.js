class ClosedCartesianTrajectory {
  constructor (mass, positionFunction, velocityFunction, color) {
    this.mass = mass;
    this.positionFunction = positionFunction;
    this.velocityFunction = velocityFunction || this.approximateVelocity;
    this.color = color;
  }

  approximateVelocity(t, delta) {
    return this.positionFunction(t + delta).sub(this.positionFunction(t)).over(delta);
  }

  get hasClosedForm () { return true; }

  at (t, delta) {
    return new Particle(
        this.mass,
        this.positionFunction(t),
        this.velocityFunction(t, delta));
  }

  // Convenience function. Assumes velocity also has a closed form.
  get approximateForm () {
    return new CartesianTrajectory(
        this.mass,
        this.positionFunction(0),
        this.velocityFunction(0),
        this.color,
        this.name);
  }
}


class CartesianTrajectory {
  constructor (mass, initialPosition, initialVelocity, color) {
    this.mass = mass;
    this.initialValue = new Particle(mass, initialPosition, initialVelocity);
    this.color = color;
  }

  get hasClosedForm () { return false; }
  get includesPotential () { return false; }

  update (particle, delta, dV, time) {
    // Postmature optimization. This is one of our hot functions. Reaching into
    // private accessors etc. here.
    let newPosition, newVelocity;
    if (this.position instanceof Vector2) {
      newPosition = new Vector2(
          particle.position._x + delta * particle.velocity._x,
          particle.position._y + delta * particle.velocity._y);
    } else {
      newPosition = particle.position.add(particle.velocity.scale(delta));
    }
    if (this.velocity instanceof Vector2) {
      newVelocity = new Vector2(
          particle.velocity._x - dV._x / this.mass,
          particle.velocity._y - dV._y / this.mass);
    } else {
      newVelocity = particle.velocity.sub(dV.over(this.mass));
    }
    return new Particle(this.mass, newPosition, newVelocity);
  }
}


class OscillatingTrajectory extends ClosedCartesianTrajectory {
  constructor (mass, initialPosition, initialVelocity, color, period) {
    const w = period / Math.sqrt(mass);
    // Acos(0w)+Bsin(0w) = x0, so A=x0.
    // d/dt Acos(0w)+Bsin(0w) = wBcos(0w)-wAsin(0w) = vx0, so B=vx0/w.
    const Hx = new HarmonicOscillator(
        initialPosition.x, initialVelocity.x/w, w);
    const Hy = new HarmonicOscillator(
        initialPosition.y, initialVelocity.y/w, w);
    const dHx = Hx.derivative();
    const dHy = Hy.derivative();
    super(
        mass,
        (t) => new Vector2(Hx.at(t), Hy.at(t)),
        (t) => new Vector2(dHx.at(t), dHy.at(t)),
        color);
  }
}

class PolarTrajectory extends CartesianTrajectory {
  update (particle, delta, dV, time) {
    const newPosition = particle.position.add(particle.velocity.scale(delta));

    const dRDotDt = particle.velocity.theta**2 * particle.position.r;
    const dThetaDotDt = -2 * particle.velocity.r * particle.velocity.theta / particle.position.r;
    const polarATerm = new Polar(dRDotDt, dThetaDotDt);
    const dVdq = dV.over(delta);
    const potentialATerm = new Polar(
          dVdq.r,
          dVdq.theta / particle.position.rSquared);
    const newVelocity = particle.velocity
      .add(polarATerm.scale(delta))
      .sub(potentialATerm.scale(delta).over(this.mass));

    if (newPosition._theta > TAU || newPosition._theta < 0) {
      newPosition._theta = newPosition._theta % TAU;
    }

    return new PolarParticle(this.mass, newPosition, newVelocity);
  }
}
