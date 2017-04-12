const FIDELITY = 1000;
const SPEED = 1;
const RESOLUTION = 0.1;
const HALFLEN = 7;
const HBAR = 1;

const universe = UfromH((psi) => psi.X());  // The laws of physics
const wave = mkState((x) => C.rtheta(Math.exp(-(x**2)), 3*x));  // The state of the universe
const world = new ThreeWorld('#root', {fidelity: FIDELITY, speed: SPEED})  // The thing that translates from abstract vectors into pixels painted on a canvas
const visualizer = world.addWaveVisualization(wave, universe, {origin: [0, 25, 0]});  // Adds the wave function to the world.
visualizer.addAltView((psi) => psi.ft(), {origin: [0, -25, 25], drawSurface: false});  // Adds an alternative view (namely, the fourier transform) to the same world.
world.run();
