const grad = (S, d=0.01) => (x, y, z) => {
  const dS_dx = (S(x + d, y, z) - S(x, y, z)) / d;
  const dS_dy = (S(x, y + d, z) - S(x ,y, z)) / d;
  const dS_dz = (S(x, y, z + d) - S(x ,y, z)) / d;
  return new THREE.Vector3(dS_dx, dS_dy, dS_dz);
};

const div = (F, d=0.01) => (x, y, z) => {
  const dU_dx = (F(x + d, y, z).x - F(x, y, z).x) / d;
  const dV_dy = (F(x, y + d, z).y - F(x ,y, z).y) / d;
  const dW_dz = (F(x, y, z + d).z - F(x ,y, z).z) / d;
  return dU_dx + dV_dy + dW_dz;
};

const curl = (F, d=0.01) => (x, y, z) => {
  const dFx_dy = (F(x, y+d, z).x - F(x, y, z).x) / d;
  const dFx_dz = (F(x, y, z+d).x - F(x, y, z).x) / d;
  const dFy_dx = (F(x+d, y, z).y - F(x, y, z).y) / d;
  const dFy_dz = (F(x, y, z+d).y - F(x, y, z).y) / d;
  const dFz_dx = (F(x+d, y, z).z - F(x, y, z).z) / d;
  const dFz_dy = (F(x, y+d, z).z - F(x, y, z).z) / d;
  return new THREE.Vector3(dFz_dy - dFy_dz, dFx_dz - dFz_dx, dFy_dx - dFx_dy);
};

const Fdc = (F, d=0.1) => (x, y, z) => {
  let result = null;
  if (z < 2) {
    result = F(x, y, z);
  } else if (z < 52) {
    result = new THREE.Vector3(0, 0, div(F, d)(x, y, z));
  } else if (z < 102) {
    result = curl(F, d)(x, y, z);
  }
  return new THREE.Vector3(result.x, result.y, result.z);
};

const F = (x, y, z) => new THREE.Vector3(y*x/5, x*y/5, 0);
// const W = new VectorField('#root', F, {zrange: range(1)}).animate();
const W = new VectorField('#root', Fdc(F), {
  zrange: [0, 50, 100],
}).animate();
