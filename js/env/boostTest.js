
const V = (qs, time) => 0;

const traj1 = [new CartesianTrajectory(
      10, Vector2.one.scale(0.5), Vector2.zero, 'magenta')]
const traj2 = [new CartesianTrajectory(
      10, Vector2.one.scale(0.5), Vector2.unitX.scale(3), 'magenta')];

const world1 = new ClassicalWorld(traj1, V);
const world2 = new ClassicalWorld(traj2, V);

const grid = new Grid(3);
const viewport1 = new Viewport().add(grid);
const viewport2 = new Viewport().add(grid)
  .setTransform((t) => AffineTransform2.translation(Vector2.unitX.scale(-3 * t)));

const executor = new Executor('#controls', 1, 30, 1000)
  .add('#primary', world1, viewport1)
  .add('#secondary', world2, viewport2)
  .run();
