const FIDELITY = 1000;
const SPEED = 0.1;
const RESOLUTION = 0.1;
const HALFLEN = 7;
const HBAR = 1;

var last_step = Date.now();
const HfromH = (H, hbar=HBAR) => (psi, epsilon) => {
  // |ψ⟩ → |ψ⟩ - ε(i/ħ)H|ψ⟩
  if (Date.now() - last_step > 1000) {
    last_step = Date.now();
    return H(psi);
  }
}

const H = (psi) => {
  let V = psi.clone().X().X();
  return psi.D().D().sub(V);
}

const universe = UfromH(H);  // The laws of physics
const wave = mkState((x) => C.rtheta(Math.exp(-(x**2)), 0));  // The state of the universe
const world = new ThreeWorld('#root', {fidelity: FIDELITY, speed: SPEED})  // The thing that translates from abstract vectors into pixels painted on a canvas
const visualizer = world.addWaveVisualization(wave, universe, {origin: [0, 25, 0]});  // Adds the wave function to the world.
visualizer.addAltView((psi) => psi.ft(), {origin: [0, -25, 25], drawSurface: false});  // Adds an alternative view (namely, the fourier transform) to the same world.
world.run();
