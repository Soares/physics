const FIDELITY = 1000;
const SPEED = 1;
const RESOLUTION = 0.1;
const HALFLEN = 7;
const HBAR = 1;

// Playing with a bunch of spinors:
const up = CVector.fromCs(C.one(), C.zero());
const down = CVector.fromCs(C.zero(), C.one());
const left = CVector.fromCs(C.one(), C.one());
const right = CVector.fromCs(C.one(), C.one(-1));
const in_ = CVector.fromCs(C.one(), C.i());
const out = CVector.fromCs(C.one(), C.i(-1));
const sigmaXY = sigmaX.clone().stretch(0.5).add(sigmaY.clone().stretch(0.5));

const world = new ThreeWorld('#root', {fidelity: FIDELITY, speed: SPEED})  // The thing that translates from abstract vectors into pixels painted on a canvas
const universe = UfromH((psi) => psi.transform(sigmaY));
world.addWaveVisualization(up, universe, {origin: [-30, 0, 0], color: [1, 0, 0]});
world.addWaveVisualization(down, universe, {origin: [-20, 0, 0], color: [1, 1, 0]});
world.addWaveVisualization(left, universe, {origin: [-10, 0, 0], color: [0, 1, 0]});
world.addWaveVisualization(right, universe, {origin: [20, 0, 0], color: [0, 1, 1]});
world.addWaveVisualization(in_, universe, {origin: [30, 0, 0], color: [0, 0, 1]});
world.addWaveVisualization(out, universe, {origin: [40, 0, 0], color: [1, 0, 1]});
world.run();
