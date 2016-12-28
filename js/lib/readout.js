const _readout_precision = 3;

class Readout {
  constructor(root) {
    this.root = (typeof root == typeof '') ? document.querySelector(root) : root;
    this.potentialOutput = this.root.querySelector('output.potential');
    this.kineticOutput = this.root.querySelector('output.kinetic');
    this.energyOutput = this.root.querySelector('output.energy');
    this.elapsedOutput = this.root.querySelector('output.elapsed');
  }

  update (world) {
    this.T = world.kineticEnergy;
    this.V = world.potentialEnergy == undefined ? '[undefined]' : world.potentialEnergy;
    this.E = world.totalEnergy == undefined ? '[undefined]' : world.totalEnergy;
    this.elapsedTime = world.time;
  }

  set V (V) {
    this.potentialOutput.value = Number(V).toExponential(_readout_precision) + ' J';
  }
  set T (T) {
    this.kineticOutput.value = Number(T).toExponential(_readout_precision) + ' J';
  }
  set E (E) {
    this.energyOutput.value = Number(E).toExponential(_readout_precision) + ' J';
  }
  set elapsedTime (t) {
    this.elapsedOutput.value = Number(t).toFixed(_readout_precision) + 's';
  }
};

