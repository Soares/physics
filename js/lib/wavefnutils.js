// This file depends (lazily) on the globals, which you must define elsewhere:
// HALFLEN (suggested range: ~5 to ~50, higher = harder to compute)
// RESOLUTION (suggested range: ~0.01 to ~0.1, higher = harder to compute)
// HBAR (suggsted value: 1, this scales the Hamiltonian in the usual way)

const mkState = (f) => FVector.fromFunction(f, -HALFLEN, HALFLEN, RESOLUTION);

// -----------------------------------------------------------------------------
// Universes and meta-universes

/* For when you have a Hamiltonian and you want a universe */
const UfromH = (H, hbar=HBAR) => (psi, epsilon) => {
  // |ψ⟩ → |ψ⟩ - ε(i/ħ)H|ψ⟩
  return psi.sub(H(psi.clone()).scale(C.i(epsilon / hbar)));
}

/* For when you have a matrix and want to use it as your Hamiltonian */
const UfromO = (O, hbar=HBAR, normalize=true) => {
  const u = UfromH ((psi) => psi.transform(O), HBAR);
  return normalize ? ((psi, epsilon) => u(psi, epsilon).normalize()) : u;
}

/* When, e.g., you want to display a perfectly good state vector in a different
 * basis */
const Uview = (f, master) => (state) => state.imitate(f(master.clone()));

/* For when you want a universe that doesn't change anything */
const IdentityU = (vec) => vec;

/* For when you want a wave packet to travel right */
const RightwardHo = (c=1) => (vec, epsilon) => {
  return vec.sub(vec.clone().D().stretch(epsilon * c));
};

/* For when you want to model something just perturbed from equilibrium */
const HarmonicOscillatorU = (omega, hbar=HBAR) => UfromH((vec) => {
  const xpart = vec.clone().X().X().stretch((omega**2)/2);
  const dpart = vec.clone().D().D().stretch((hbar**2)/2);
  return xpart.sub(dpart)
});

// -----------------------------------------------------------------------------
// Making state vectors

// Making a nice wavy wave function.
const waveyfn = (ampadjust, freq) => (x) => {
  return C.rtheta(Math.exp(-((x/ampadjust)**2)), freq * x);
}

// Making a nice square function.
const squarefn = (from, to, height=1, phase=0) => (x) => {
  return (x >= from && x <= to) ? C.rtheta(height, phase) : C.zero();
}

// The first 3 stable harmonic oscillator waves (for different frequencies):
const harmonicOscillatorGroundState = (omega, phase=0) => {
  return (x) => C.rtheta(Math.exp(-omega * (x**2) / (2 * HBAR)), phase);
}
const harmonicOscillatorState2 = (omega, phase=0) => {
  const psi = harmonicOscillatorGroundState(omega, phase);
  return (x) => psi(x).mul(C.i(2*omega*x));
}
const harmonicOscillatorState3 = (omega, phase=0) => {
  const psi = harmonicOscillatorGroundState(omega, phase);
  return (x) => psi(x).stretch(-HBAR + (2 * omega * (x**2)));
}

// -----------------------------------------------------------------------------
// Example:
// const universe = UfromH((psi) => psi.X());  // The laws of physics
// const wave = mkState((x) => C.rtheta(Math.exp(-(x**2)), 3*x));  // The state of the universe
// const world = new ThreeWorld('#root', {fidelity: FIDELITY, speed: SPEED})  // The thing that translates from abstract vectors into pixels painted on a canvas
// const visualizer = world.addWaveVisualization(wave, universe, {origin: [0, 25, 0]});  // Adds the wave function to the world.
// visualizer.addAltView((psi) => psi.ft(), {origin: [0, -25, 25], drawSurface: false});  // Adds an alternative view (namely, the fourier transform) to the same world.
// world.run();
