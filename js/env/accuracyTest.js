const omega = 1;
const oscillate = (qs) => sum(qs, (q) => 0.5 * omega * q.position.rSquared);

const closedJ = [
  new OscillatingTrajectory(
      10, new Vector2(50, 0), new Vector2(0, 15 * omega), 'magenta', omega),
  new OscillatingTrajectory(
      2, new Vector2(0, -10), new Vector2(10 * omega, 0), 'cyan', omega),
];
const closedW = new ClassicalWorld(closedJ, oscillate);

const approxJ = closedJ.map((j) => j.approximateForm);
const approxW = new ClassicalWorld(approxJ, oscillate);

const viewport = new Viewport().add(new Grid(10, 10));
const executor = new Executor('#controls', 10, 5, 1000)
  .add('#primary', closedW, viewport)
  .add('#secondary', approxW, viewport)
  .run();
