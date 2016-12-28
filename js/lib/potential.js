class PotentialFunction {
  constructor (potentialFunction) {
    this._function = potentialFunction;
  }

  get needsApproximating () { return false; }

  at (configuration, time) {
    return this._function(configuration, time);
  }

  delta (configuration, time, energy) {
    // Postmature optimization. This is one of our hottest functions, and
    // mutation makes it lots better. Thus, we mutate some otherwise-immutable
    // things, like the particle's position. Such is life.
    return configuration.map((particle, i) => (delta) => {
      if (particle.position instanceof Vector2) {
        const savedX = particle.position._x;
        const savedY = particle.position._y;
        particle._position._x += delta;
        const dVdx = this._function(configuration, time) - energy;
        particle._position._x = savedX;
        particle._position._y += delta;
        const dVdy = this._function(configuration, time) - energy;
        particle._position._y = savedY;
        return new Vector2(dVdx, dVdy);
      } else if (particle.position._canMutate) {
        const dVdn = [];
        for (let i = 0; i < particle.position.dimension; i++) {
          particle.position._shift(i, delta);
          dVdn.push(this._function(configuration, time) - energy);
          particle.position._shift(i, -delta);
        }
        return new particle.position.constructor(...dVdn);
      }
      const differences = [];
      for (let j = 0; j < particle.position.dimension; j++) {
        configuration[i] = particle.perturb(
            particle.position.constructor.unit(j).scale(delta));
        differences.push(this._function(configuration, time) - energy);
      }
      configuration[i] = particle;
      return new particle.position.constructor.fromArray(differences);
    });
  }
}


class ApproximatePotential {
  constructor (initialEnergy) {
    this.initialEnergy = initialEnergy;
  }

  get needsApproximating () { return true; }

  delta (configuration, time, energy) {
    return configuration.map((particle) => (delta) => {
      throw new Error('Cannot approximate forces from approximated potential')
    });
  }

  update (energy, configuration, nextConfiguration) {
    const forceExerted = configuration.reduce((total, particle, i) => {
        const deltaForce = nextConfiguration[i].velocity
          .sub(particle.velocity)
          .scale(particle.mass);
        return total + sum(deltaForce.values);
    }, 0);
    return energy - forceExerted;
  }
}
