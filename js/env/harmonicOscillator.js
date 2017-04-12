const FIDELITY = 5000;
const SPEED = 1;
const RESOLUTION = 0.1;
const HALFLEN = 7;
const HBAR = 1;
const omega = 1;

const psi0 = mkState(harmonicOscillatorGroundState(omega));
const psi1 = mkState(harmonicOscillatorState2(omega));
const psi2 = mkState(harmonicOscillatorState3(omega));

const universe = HarmonicOscillatorU(omega);
const wave = psi0;  // try switching this to psi1 or psi2
const world = new ThreeWorld('#root', {fidelity: FIDELITY, speed: SPEED})  // The thing that translates from abstract vectors into pixels painted on a canvas
const visualizer = world.addWaveVisualization(wave, universe, {origin: [0, 25, 0]});
visualizer.addAltView((psi) => psi.D(), {origin: [0, 25, 0], color: [0, 1, 0]}); 
visualizer.addAltView((psi) => psi.D().D(), {origin: [0, 25, 0], color: [1, 1, 0]}); 
visualizer.addAltView((psi) => psi.ft(), {origin: [0, -25, 0], drawSurface: false});
world.run(); // Note: This world will deteroriate pretty quickly, b/c floating point error plus the fact that most photon packets are very quick to diverge
