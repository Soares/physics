class SimWorld {
  constructor (trajectories) {
    this.trajectories = trajectories;
    this.time = 0;
    this.hasClosedForm = trajectories.every((t) => t.hasClosedForm);
    this.configuration = trajectories.map((t) => t.hasClosedForm ?  t.at(0) : t.initialValue);
    this._timeCache = 0;
  }

  update (timeDifference, stepSize) {
    timeDifference += this._timeCache;
    if (Math.abs(timeDifference) < stepSize) {
      // Not enough time has passed for us to want to update yet.
      this._timeCache = timeDifference;
      return;
    }

    if (this.hasClosedForm) {
      this._timeCache = 0;
      this.time += timeDifference;
      this.configuration = this.trajectories.map((t) => t.at(this.time, stepSize));
    } else {
      const numSteps = Math.floor(Math.abs(timeDifference) / stepSize);
      const stepDirection = Math.sign(timeDifference);
      const delta = stepDirection * stepSize;
      this._timeCache = timeDifference - (numSteps * delta);
      const endTime = this.time + timeDifference - this._timeCache;
      for (let step = 0; step < numSteps; step++) {
        const delta = stepDirection * stepSize;
        this.time += delta;
        this.configuration = this.trajectories.map((t, i) => {
          return t.hasClosedForm ? t.at(this.time, stepSize) : t.update(this.configuration[i], delta, this.time);
        });
      }
      this.time = endTime; // helps prevent accumulation of floating point errors.
    }
  }

  get particles () {
    return this.configuration;
  }
}
