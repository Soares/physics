const constV = (qs) => 0;

const g = 10
const linV = (qs) => sum(qs, (q) => g * q.position.y);

const omega = 1;
const sqV = (qs) => sum(qs, (q) => 0.5 * omega * q.position.rSquared);

const f = (t) => new Vector2(10 * Math.cos(3 * t), 20 * Math.sin(3 * t));
const fdot = (t) => new Vector2(-30 * Math.sin(3 * t), 60 * Math.cos(3 * t));
const fdotdot = (t) => new Vector2(-90 * Math.cos(3 * t), -180 * Math.sin(3 * t));

const relabelV = (V) => (qs, t) => V(qs.map((q) => q.perturb(f(t).negate())));

class AltJ extends CartesianTrajectory {
  constructor (mass, position, velocity, color) {
    super(mass, position.add(f(0)), velocity.add(fdot(0)), color);
  }

  update (particle, delta, dV, time) {
    const faccel = fdotdot(time);
    // Postmature optimization. This is one of our hot functions. Reaching into
    // private accessors etc. here.
    // const newPosition = particle.position.add(particle.velocity.scale(delta));
    const newPosition = new Vector2(
        particle.position._x + delta * particle.velocity._x,
        particle.position._y + delta * particle.velocity._y);
    // const newVelocity = particle.velocity.sub(dV.over(this.mass));
    const newVelocity = new Vector2(
        particle.velocity._x + (faccel._x * delta) - (dV._x / this.mass),
        particle.velocity._y + (faccel._y * delta) - (dV._y / this.mass));
    return new Particle(this.mass, newPosition, newVelocity);
  }
}

const magenta = [100, new Vector2(30, 30), new Vector2(10, 0), 'magenta'];
const cyan = [1, new Vector2(50, 50), new Vector2(-10, 0.5), 'cyan'];
const amber = [Circle2D.area(1), new Vector2(-40, -30), new Vector2(8, -1), 'orange'];
const particleSpecs = [cyan, magenta, amber];

const V1 = sqV;
const J1 = particleSpecs.map((ps) => new CartesianTrajectory(...ps));
const W1 = new ClassicalWorld(J1, V1);

const V2 = relabelV(V1);
const J2 = particleSpecs.map((ps) => new AltJ(...ps));
const W2 = new ClassicalWorld(J2, V2);

const grid = new Grid(50, 50);
const P1 = new Viewport()
  .add(grid)
  .add(grid.withColor(Grid.green).withTransform(
        (t) => AffineTransform2.translation(f(t).negate())));
const P2 = new Viewport()
  .add(grid)
  // .add(grid.withColor(Grid.blue).withTransform((t) => AffineTransform2.translation(f(t))))
  // .setTransform((t) => AffineTransform2.translation(f(t).negate()));

new Executor('#controls', 1, 3, 1000)
  .add('#primary', W1, P1)
  .add('#secondary', W2, P2)
  .run();
