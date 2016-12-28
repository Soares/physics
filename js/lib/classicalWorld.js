class ClassicalWorld {
  constructor (trajectories, potential = 0) {
    this.trajectories = trajectories;
    this.hasClosedForm = trajectories.every((trajectory) => trajectory.hasClosedForm);

    if (potential instanceof Function) {
      this.potential = new PotentialFunction(potential);
    } else if (typeof potential == typeof 0) {
      this.potential = new ApproximatePotential(potential);
    } else {
      this.potential = potential;
    }

    this.time = 0;
    this.configuration = trajectories.map((trajectory) =>
        trajectory.hasClosedForm ?
          trajectory.at(0, 1) :
          trajectory.initialValue);

    // Note: potential energy is allowed to both not need approximating, and be
    // undefined. In that case, it should return undefined from an at(t) call.
    this._potentialEnergy = this.potential.needsApproximating ?
        this.potential.initialEnergy :
        this.potential.at(this.configuration, 0, 1);
    this._kineticEnergy = undefined;

    this._timeCache = 0;
  }

  get potentialEnergy () {
    return this._potentialEnergy;
  }

  get kineticEnergy () {
    if (this._kineticEnergy == undefined) {
      this._kineticEnergy = sum(this.configuration, (particle) => particle.T);
    }
    return this._kineticEnergy;
  }

  get totalEnergy () {
    if (this._potentialEnergy == undefined) {
      return undefined;
    }
    return this.potentialEnergy + this.kineticEnergy;
  }

  addTrajectory (trajectory) {
    this.trajectories.push(trajectory);
    this.configuration.push(trajectory.hasClosedForm ? trajectory.at(this.time) : trajectory.initialValue);
    this._kineticEnergy = undefined;
    this.hasClosedForm = this.hasClosedForm && trajectory.hasClosedForm;
  }

  update (timeDifference, stepSize) {
    timeDifference += this._timeCache;
    if (Math.abs(timeDifference) < stepSize) {
      // Not enough time has passed for us to want to update yet.
      this._timeCache = timeDifference;
      return;
    }

    if (this.hasClosedForm && !this.potential.needsApproximating) {
      this._timeCache = 0;
      this.time += timeDifference;
      this.configuration = this.trajectories.map((trajectory) => trajectory.at(this.time, stepSize));
      this._potentialEnergy = this.potential.at(this.configuration, this.time, stepSize);
      this._kineticEnergy = undefined;
    } else {
      const numSteps = Math.floor(Math.abs(timeDifference) / stepSize);
      const stepDirection = Math.sign(timeDifference);
      const delta = stepDirection * stepSize;
      this._timeCache = timeDifference - (numSteps * delta);
      const endTime = this.time + timeDifference - this._timeCache;
      for (let step = 0; step < numSteps; step++) {
        const delta = stepDirection * stepSize;
        // Note: The ordering of the below statements is delicate.
        const dV = this.potential.delta(
            this.configuration,
            this.time,
            this._potentialEnergy);
        this.time += delta;
        const nextConfiguration = this.trajectories.map((trajectory, i) => {
          if (trajectory.hasClosedForm) {
            return trajectory.at(this.time, stepSize);
          } else if (trajectory.includesPotential) {
            return trajectory.update(this.configuration[i], delta, this.time);
          }
          return trajectory.update(
              this.configuration[i],
              delta,
              dV[i](delta),
              this.time);
        });
        this._potentialEnergy = this.potential.needsApproximating ?
          this.potential.update(
              this._potentialEnergy, this.configuration, nextConfiguration, delta) :
          this.potential.at(nextConfiguration, this.time, stepSize);
        this._kineticEnergy = undefined;
        this.configuration = nextConfiguration;
      }
      this.time = endTime; // helps prevent accumulation of floating point errors.
    }
  }

  get particles () {
    return this.configuration;
  }
}
