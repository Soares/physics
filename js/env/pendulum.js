const mass = 10;
const length = 20;
const g = -100;
const initialAngle = TAU/8;
const initialSpeed = 1.3; // rads per second

class PendulumTrajectory extends PolarTrajectory {
  get includesPotential () { return true; }

  constructor (g, mass, length, initialAngle, initialSpeed, color) {
    super(mass, new Polar(length, initialAngle), new Polar(0, initialSpeed), color);
    this.g = g;
    this.mass = mass;
    this.length = length;
  }

  update (particle, delta, time) {
    const newPosition = particle.position.add(particle.velocity.scale(delta));
    const g_ml = this.g / (this.mass * this.length);
    const acceleration = new Polar(0, -g_ml * Math.cos(particle.position.theta));
    const newVelocity = particle.velocity.add(acceleration.scale(delta));
    return new PolarParticle(this.mass, newPosition, newVelocity);
  }
}

const J1 = [new PendulumTrajectory(g, mass, length, initialAngle, initialSpeed, 'cyan')];
const W1 = new ClassicalWorld(J1);

const theta = () => W1.configuration[0].position.theta;
const thetaDot = () => W1.configuration[0].velocity.theta;
const L = () => {
  const particle = W1.configuration[0];
  const r = particle.position.r;
  const theta = particle.position.theta;
  const rDot = particle.velocity.r;
  const thetaDot = particle.velocity.theta;
  return (mass/2) * (rDot**2 + r**2 * thetaDot**2) - g * r * Math.sin(theta);
}

const grid = new Grid(10, 10);
const viewport1 = new Viewport().add(grid)
const executor = new Executor('#controls', 10, 10, 10000)
  .add('#primary', W1, viewport1)
  .run();
