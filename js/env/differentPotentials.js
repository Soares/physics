const constV = (qs, time) => 0;
const linV = (qs, time) => qs.reduce((V, q) => V + 100 * q.position.y, 0);
const sqV = (qs, time) => qs.reduce((V, q) => V + 5 * q.position.y**2, 0);
const constGrav = (qs, time) => qs.reduce((V, q) => V + 1 * q.mass * q.position.y, 0);
const gravity = (qs, time) => {
  const G = 100;
  var V = 0;
  for (let i = 0; i < qs.length; i++) {
    for (let j = i+1; j < qs.length; j++) {
      V -= G * qs[i].mass * qs[j].mass / Math.abs(qs[i].position.sub(qs[j].position).r);
    }
  }
  return V;
};

const trajectories = [
  new CartesianTrajectory(100, Vector2.one.scale(0.5), Vector2.zero, 'magenta'),
  new CartesianTrajectory(1, new Vector2(50, 50), new Vector2(-1, 0.5), 'cyan'),
  new CartesianTrajectory((1 * TAU / 2) ** 2, new Vector2(-40, -30), new Vector2(8, -1), 'yellow'),
];

const world = new ClassicalWorld(trajectories, gravity);
const viewport1 = new Viewport().add(new Grid(10, 10));
const executor = new Executor('#controls', 1, 5, 1000)
  .add('#primary', world, viewport1)
  .run();

