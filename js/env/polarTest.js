const constV = (qs) => 0;

const g = 1
const linV = (qs) => sum(qs, (q) => g * q.mass * q.position.y);

const omega = 20;
const sqV = (qs) => sum(qs, (q) => 0.5 * omega * q.position.rSquared);

const yourPositionToMine = (q) => new Polar(q.r, q.theta);
const myPositionToYours = (q) => new Vector2(q.x, q.y);
const yourVelocitiesToMine = (q, qdot) =>
  new Polar(
      (q.x * qdot.x + q.y * qdot.y) / q.r,
      (qdot.y * q.x - qdot.x * q.y) / q.rSquared);
const myVelocitiesToYours = (q, qdot) =>
  new Vector2(
      qdot.r * Math.cos(q.theta) - q.r * qdot.theta * Math.sin(q.theta),
      qdot.r * Math.sin(q.theta) + q.r * qdot.theta * Math.cos(q.theta));

// Note: This is _really_ inefficient, and the core bottleneck if used. If you
// want performance, rewrite the transformed V by hand.
const relabelParticle = (q, t) => {
  return q.relabel(
      myPositionToYours(q.position, t),
      myVelocitiesToYours(q.position, q.velocity, t));
}
const relabelV = (V) => (qs, t) => V(qs.map((q) => relabelParticle(q, t)));

// When things get too close to the origin, you're going to have a bad day.
// In this case, we make it about 400s.
const cyan = [100, new Vector2(50, 0), new Vector2(5, 0), 'cyan'];
const magenta = [100, new Vector2(100, 10), new Vector2(30, 50), 'magenta'];
const orange = [100, new Vector2(50, 50), new Vector2(0, 5), 'orange'];
const particleSpecs = [cyan, magenta, orange];
const translateSpec = ([m, p, v, c]) => [m, yourPositionToMine(p), yourVelocitiesToMine(p, v), c];

const V1 = sqV;
const J1 = particleSpecs.map((ps) => new CartesianTrajectory(...ps));
const W1 = new ClassicalWorld(J1, V1);

const V2 = V1;
const J2 = particleSpecs.map((ps) => new PolarTrajectory(...translateSpec(ps)));
const W2 = new ClassicalWorld(J2, V2);

const grid = new Grid(10, 10);
const viewport1 = new Viewport().add(grid)
const viewport2 = new Viewport().add(grid)
const executor = new Executor('#controls', 1, 4, 1000)
  .add('#primary', W1, viewport1)
  .add('#secondary', W2, viewport2)
  .run();
