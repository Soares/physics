const FIDELITY = 1000;
const SPEED = 2;
const RESOLUTION = 0.01;
const HALFLEN = 10;

const UfromH = (H) => (psi, epsilon) => {
  // |ψ⟩ → |ψ⟩ - iεH|ψ⟩
  return psi.sub(H(psi.clone()).scale(C.i(epsilon)));
}

const psi = FVector.fromFunction(
    (x) => C.rtheta(Math.exp(-(x**2)), 3*x),
    -HALFLEN, HALFLEN, RESOLUTION);

const SpinFasterFurther = UfromH((vec) => vec.X());

// A simulation of a particle evolving under the hamiltonian H|ψ⟩ = xψ(x)
// turns out it look /awesome/
const world = new ThreeWorld('#root', {fidelity: FIDELITY, speed: SPEED})
  .add(new FVectorViz(psi, SpinFasterFurther))
  .add(new FVectorViz(psi, SpinFasterFurther))
  .run();
