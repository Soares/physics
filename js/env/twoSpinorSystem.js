const FIDELITY = 1000;
const SPEED = 1;
const RESOLUTION = 0.1;
const HALFLEN = 7;
const HBAR = 1;

// 2-spinor system:
const twoSpinors = CVector.fromCs(C.one(), C.one(-1), C.one(-1), C.one()).normalize();
const O = Operator.hermetian([
    [C.parse('1'),  C.parse('0'),  C.parse('0'),   C.parse('1')],
                   [C.parse('1'),  C.parse('0'),   C.parse('0')],
                                  [C.parse('1'),   C.parse('0')],
                                                  [C.parse('-1')],
]);
const alicePart = (psi) => CVector.fromCs(psi.at(0).add(psi.at(1)), psi.at(2).add(psi.at(3)));
const bobPart = (psi) => CVector.fromCs(psi.at(0).add(psi.at(2)), psi.at(1).add(psi.at(3)));

const world = new ThreeWorld('#root', {fidelity: FIDELITY, speed: SPEED})  // The thing that translates from abstract vectors into pixels painted on a canvas
const universe = UfromO(O);
const visualizer = world.addWaveVisualization(twoSpinors, universe, {origin: [0, 0, 0], color: [0, 1, 0], transformer: O});
visualizer.addAltView(alicePart, {origin: [-15, 0, 0], color: [0, 0, 1]});
visualizer.addAltView(bobPart, {origin: [15, 0, 0], color: [1, 0, 1]});
world.run();
