class FakeParticle {
  constructor (q, p, color) {
    this.position = new Vector2(q, p);
    this.mass = 1000;
  }

  get radius () { return Circle2D.radius(this.mass); }

  get q () { return this.position.x; }
  get p () { return this.position.y; }
}


class Traj2 {
  constructor (initQ, initP, color = 'black') {
    this.initialValue = new FakeParticle(initQ, initP);
    this.color = color;
  }

  update (prevParticle, timeDelta, totalTime) {
    const q = prevParticle.q;
    const p = prevParticle.p;
    const R = Math.sqrt(q**2 + p**2);
    const dH_dp = p; // / R;
    const dH_dq = q; // / R;
    const dp_dt = -dH_dq;
    const dq_dt = dH_dp;
    // timeDelta = timeDelta * 100;
    const dp = dp_dt * timeDelta;
    const dq = dq_dt * timeDelta;
    return new FakeParticle(q + dq, p + dp);
  }
}

a = new Traj2(0, 100, 'red');
b = new Traj2(50, 50, 'green');
c = new Traj2(100, 0, 'blue');
d = new Traj2(2, 2, 'black');
e = new Traj2(500, 250, 'cyan');

const grid = new Grid(100, 100);
const viewport = new Viewport().add(grid).setDrawVelocityArrows(false);
const world = new SimWorld([a, b, c, d, e]);

const executor = new Executor('#controls', 1, 1, 1000)
  .add('#primary', world, viewport)
  .run();
