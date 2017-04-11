const UfromH = (H) => (psi, epsilon) => {
  return psi.sub(H(psi.clone().scale(ComplexCoefficient.i(epsilon))));
}
const IdentityU = (vec) => vec;


const FIDELITY = 2000;
const TIMESCALE = 5;
const RESOLUTION = 0.01;
const OFFSET = 10;

const psi = StateVector.fromFunction(
    (x) => ComplexCoefficient.fromCartesian(Math.cos(3*x), Math.sin(3*x)).stretch(Math.exp(-((x)**2))),
    -OFFSET, OFFSET, RESOLUTION);
const phi = StateVector.fromFunction(
    (x) => ComplexCoefficient.fromCartesian(Math.cos(2*x), Math.sin(2*x)).stretch(Math.exp(-((x/2)**2))),
    -OFFSET, OFFSET, RESOLUTION);
const psi0 = psi.clone();  // For debugging.

const SpinFasterFurther = UfromH((vec) => vec.X(-OFFSET, RESOLUTION));
const ScaleBySelf = UfromH((vec) => vec);
const RightGoingZaxon = (vec, epsilon, c=3) => {
  return vec.sub(vec.clone().D(RESOLUTION).stretch(epsilon * c));
};
const HisjustT = (vec, epsilon) => {
  return vec.add(vec.clone().D(RESOLUTION).D(RESOLUTION).scale(ComplexCoefficient.i().stretch(epsilon / 2)));
};
const TestU = (vec, epsilon, omega=1, hbar=1) => {
  const dViaX = vec.clone().X(-OFFSET, RESOLUTION).X(-OFFSET, RESOLUTION).scale(ComplexCoefficient.i(-(omega**2)/(2*hbar)));
  const dViaP = vec.clone().D(RESOLUTION).D(RESOLUTION).scale(ComplexCoefficient.i(hbar/2));
  return vec.add(dViaX.add(dViaP).stretch(epsilon));
};


const world = new ThreeWorld('#root')
  .add(new WaveFunction1DViz(psi, SpinFasterFurther, {
    fidelity: FIDELITY, timeScale: TIMESCALE, length: OFFSET,
  }))
  // .add(new WaveFunction1DViz(phi, TestU, {
  //   fidelity: FIDELITY, timeScale: 1, length: OFFSET, color: new THREE.Color(0, 0, 1), offset: new THREE.Vector3(0, 0, -50),
  // }))
  // .add(new WaveFunction1DViz(psi.clone().D(RESOLUTION), (vec) => vec.imitate(psi.clone().D(RESOLUTION)), {
  //   fidelity: FIDELITY, timeScale: 0.1, length: OFFSET,
  //   color: new THREE.Color(0, 1, 0)
  // }))
  // .add(new WaveFunction1DViz(psi.clone().D(RESOLUTION).D(RESOLUTION), (vec) => vec.imitate(psi.clone().D(RESOLUTION).D(RESOLUTION)), {
  //   fidelity: FIDELITY, timeScale: 0.1, length: OFFSET,
  //   color: new THREE.Color(0, 1, 1)
  // }))
  .run();
