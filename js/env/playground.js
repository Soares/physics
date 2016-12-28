const constV = (qs, time) => 0;

const magenta = [1000, new Vector2(10, 10), new Vector2(50, 0), 'magenta'];
const cyan = [1000, new Vector2(-10, -10), new Vector2(-50, 0), 'cyan'];
const particleSpecs = [magenta, cyan];

const V1 = constV;
const J1 = particleSpecs.map((ps) => new CartesianTrajectory(...ps));
const W1 = new ClassicalWorld(J1, V1);

const grid = new Grid(100, 100);
const viewport1 = new Viewport().add(grid)

const executor = new Executor('#controls', 1, 1, 1000)
  .add('#primary', W1, viewport1)
  .run();
