const FIDELITY = 1000;
const SPEED = 2;
const RESOLUTION = 0.01;
const HALFLEN = 10;
const HBAR = 1;

const world = new ThreeWorld('#root', {fidelity: FIDELITY, speed: SPEED});
const wave = FVector.fromFunction(
    (x) => C.rtheta(Math.exp(-(x**2)), 3*x),
    -HALFLEN, HALFLEN, RESOLUTION);
const universe = UfromH((vec) => vec.X()); // the wave spins faster the further we go from the origin

// A simulation of a particle evolving under the hamiltonian H|ψ⟩ = xψ(x)
// turns out it looks /awesome/
world.addWaveVisualization(wave, universe);
// To add a fourier transform, capture the above line as a variable named e.g. `visualizer` and then do
// visualizer.addAltView((psi) => psi.ft(), {origin: [0, -25, 25], drawSurface: false});
// or whatever. Note that this will seriously slow things down, you'd either need to bump the resolution way up or decrease the
// fidelity or get a faster machine.
world.run();
