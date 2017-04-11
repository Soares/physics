const FIDELITY = 5000;
const SPEED = 0.1;
const RESOLUTION = 0.05;
const HALFLEN = 7;

const mkState = (f) => FVector.fromFunction(f, -HALFLEN, HALFLEN, RESOLUTION);


// -----------------------------------------------------------------------------
// Universes and meta-universes
const HBAR = 1;

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
const ho0fn = (omega, phase=0) => {
  return (x) => C.rtheta(Math.exp(-omega * (x**2) / (2 * HBAR)), phase);
}
const ho1fn = (omega, phase=0) => {
  const psi = ho0fn(omega, phase);
  return (x) => psi(x).mul(C.i(2*omega*x));
}
const ho2fn = (omega, phase=0) => {
  const psi = ho0fn(omega, phase);
  return (x) => psi(x).stretch(-HBAR + (2 * omega * (x**2)));
}


// -----------------------------------------------------------------------------
// Some tools for making simple visualizers.
const world = new ThreeWorld('#root', {
  fidelity: FIDELITY,
  speed: SPEED,
});

const viz = (vec, U, options={}) => {
  const cls = (vec instanceof FVector) ? FVectorViz : CVectorViz;
  const vizer = new cls(vec, U, options);
  world.add(vizer);
  return vizer;
};

const view = (vizer, f, options={}) => {
  if (options.transformer == undefined) {
    options.transformer = (psi) => f(master.clone());
  }
  options = vizer.options(options);
  options.isProxy = true;
  const master = vizer.psi;
  return viz(f(master.clone()), Uview(f, master), options);
};


// -----------------------------------------------------------------------------
// Your stuff goes here.

// suggested params:
// const FIDELITY = 5000;
// const SPEED = 1;
// const RESOLUTION = 0.1;
// const HALFLEN = 7;
const omega = 1;
const psi0 = mkState(ho0fn(omega));
const psi1 = mkState(ho1fn(omega));
const psi2 = mkState(ho2fn(omega));
const main = psi0;
const U = HarmonicOscillatorU(omega);
const V = viz(main, U, {origin: [0, 25, 0]});
// view(V, (psi) => psi.D(), {origin: [0, 25, 0], color: [0, 1, 0]}); 
// view(V, (psi) => psi.D().D(), {origin: [0, 25, 0], color: [1, 1, 0]}); 
view(V, (psi) => psi.ft(), {origin: [0, -25, 0], drawSurface: false});

// const main = mkState((x) => C.rtheta(Math.exp(-(x**2)), 3*x));
// // const main = mkState(squarefn(-2, 2, 1, TAU/4));
// const U = UfromH((psi) => psi.D());
// const V = viz(main, U, {origin: [0, 25, 0], transformer: (psi) => psi.X()});
// view(V, (psi) => psi.ft(), {origin: [0, -25, 25], drawSurface: false});

// Here's some spinors:
// const up = CVector.fromCs(C.one(), C.zero());
// const down = CVector.fromCs(C.zero(), C.one());
// const left = CVector.fromCs(C.one(), C.one());
// const right = CVector.fromCs(C.one(), C.one(-1));
// const in_ = CVector.fromCs(C.one(), C.i());
// const out = CVector.fromCs(C.one(), C.i(-1));
// const sigmaXY = sigmaX.clone().stretch(0.5).add(sigmaY.clone().stretch(0.5));
// const U = UfromH((psi) => psi.transform(sigmaY));
// viz(up, U, {origin: [-30, 0, 0], color: [1, 0, 0]});
// viz(down, U, {origin: [-20, 0, 0], color: [1, 1, 0]});
// viz(left, U, {origin: [-10, 0, 0], color: [0, 1, 0]});
// viz(right, U, {origin: [20, 0, 0], color: [0, 1, 1]});
// viz(in_, U, {origin: [30, 0, 0], color: [0, 0, 1]});
// viz(out, U, {origin: [40, 0, 0], color: [1, 0, 1]});


// 2-spinor system:
// const twoSpinors = CVector.fromCs(C.one(), C.one(-1), C.one(-1), C.one()).normalize();
// const O = Operator.hermetian([
//     [C.parse('1'),  C.parse('0'),  C.parse('0'),   C.parse('1')],
//                    [C.parse('1'),  C.parse('0'),   C.parse('0')],
//                                   [C.parse('1'),   C.parse('0')],
//                                                   [C.parse('-1')],
// ]);
// const alicePart = (psi) => CVector.fromCs(psi.at(0).add(psi.at(1)), psi.at(2).add(psi.at(3)));
// const bobPart = (psi) => CVector.fromCs(psi.at(0).add(psi.at(2)), psi.at(1).add(psi.at(3)));
// const U = UfromO(O);
// const V = viz(twoSpinors, U, {origin: [0, 0, 0], color: [0, 1, 0], transformer: O});
// view(V, alicePart, {origin: [-15, 0, 0], color: [0, 0, 1]});
// view(V, bobPart, {origin: [15, 0, 0], color: [1, 0, 1]});

world.run();
