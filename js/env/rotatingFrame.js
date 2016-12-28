const constV = (qs) => 0;

const g = 10
const linV = (qs) => sum(qs, (q) => g * q.position.y);

const omega = 20;
const sqV = (qs) => sum(qs, (q) => 0.5 * omega * q.position.rSquared);

const period = 0.5;
const myCoordinatesToYours = (t) => AffineTransform2.rotation(period * t);
const yourCoordinatesToMine = (t) => myCoordinatesToYours(t).inverse;

const myVelocitiesToYours = (myQ, t) => new AffineTransform2(
    Matrix2x2.rotation(period * t),
    Matrix2x2.rotation(period * t + TAU/4, period).apply(myQ));

const yourPositionFromMine = (myQ, t) => myCoordinatesToYours(t).apply(myQ);
const yourVelocityFromMine = (myQ, myQdot, t) =>
  myVelocitiesToYours(myQ, t).apply(myQdot);
const myPositionFromYours = (yourQ, t) => myCoordinatesToYours(t).reverse(yourQ);
const myVelocityFromYours = (myQ, yourQdot, t) =>
  myVelocitiesToYours(myQ, t).reverse(yourQdot);

// Note: This is _really_ inefficient, and the core bottleneck if used. If you
// want performance, rewrite the transformed V by hand.
const relabelParticle = (q, t) => {
  return q.relabel(
      yourPositionFromMine(q.position, t),
      yourVelocityFromMine(q.position, q.velocity, t));
}
const relabelV = (V) => (qs, t) => V(qs.map((q) => relabelParticle(q, t)));

class MyJ extends CartesianTrajectory {
  constructor (mass, position, velocity, color) {
    const myPos = myPositionFromYours(position, 0);
    const myVel = myVelocityFromYours(myPos, velocity, 0);
    super(mass, myPos, myVel, color);
  }
  update (particle, delta, dV, time) {
    const position = particle.position;
    const velocity = particle.velocity;
    const xCentrifugal = period**2 * position.x;
    const yCentrifugal = period**2 * position.y;
    const xCoriolis = -2 * period * velocity.y;
    const yCoriolis = 2 * period * velocity.x;
    const acceleration = new Vector2(
        xCentrifugal + xCoriolis,
        yCentrifugal + yCoriolis);
    const newPosition = position.add(velocity.scale(delta));
    const newVelocity = velocity.add(acceleration.scale(delta))
      .sub(dV.over(this.mass));
    return new Particle(this.mass, newPosition, newVelocity);
  }
}

const magenta = [100, new Vector2(10, 0), new Vector2(0, 0), 'magenta'];
const magenta2 = [100, new Vector2(100, 0), new Vector2(0, 0), 'magenta'];
const cyan = [100, new Vector2(50, 0), new Vector2(5, 0), 'cyan'];
const yellow = [100, new Vector2(0, 10), new Vector2(10 * period, 0), 'yellow'];
const yellow2 = [100, new Vector2(25, 0), new Vector2(0, -25 * period), 'yellow'];
const orange = [100, new Vector2(50, 50), new Vector2(0, 5), 'orange'];
const particleSpecs = [magenta, magenta2, cyan, yellow, yellow2, orange];

const V1 = constV;
const J1 = particleSpecs.map((ps) => new CartesianTrajectory(...ps));
const W1 = new ClassicalWorld(J1, V1);

const V2 = V1;
const J2 = particleSpecs.map((ps) => new MyJ(...ps));
const W2 = new ClassicalWorld(J2, V2);

const grid = new Grid(50, 50);
const viewport1 = new Viewport().add(grid)
const viewport2 = new Viewport().add(grid)
  .add(grid.withColor(Grid.green).withTransform(yourCoordinatesToMine))
  // .setTransform((t) => myCoordinatesToYours(t));
const executor = new Executor('#controls', 1/2, 2, 1000)
  .add('#primary', W1, viewport1)
  .add('#secondary', W2, viewport2)
  .run();
