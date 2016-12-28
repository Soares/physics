class Executor {
  constructor (controls, speed = 1, zoom = 1, fidelity = 1000) {
    this.controls = new Controls(controls, speed, zoom, fidelity);
    this.runners = [];
  }

  add (container, world, viewport, readout = '.readout', canvas = 'canvas') {
    this.runners.push(new Runner(
          container, world, this.controls, viewport, readout, canvas));
    return this;
  }

  run () {
    this.runners.forEach((r) => r.run());
    return this;
  }
}

class Runner {
  constructor (
      root,
      world,
      controls = '.controls',
      viewport = Viewport.trivial,
      readout = '.readout',
      canvas = 'canvas') {
    this.root = (typeof root == typeof '') ? document.querySelector(root) : root;
    this.canvas = this.root.querySelector(canvas);
    this.context = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.scrollWidth;
    this.canvas.height = this.canvas.scrollHeight;
    this.bounds = new Bounds(0, 0, this.canvas.width, this.canvas.height);
    this.canvasCenter = new Vector2(this.canvas.width / 2, this.canvas.height / 2);
    window.addEventListener('optimizedResize', () => {
      this.canvas.width = this.canvas.scrollWidth;
      this.canvas.height = this.canvas.scrollHeight;
      this.bounds = new Bounds(0, 0, this.canvas.width, this.canvas.height);
      this.canvasCenter = new Vector2(this.canvas.width / 2, this.canvas.height / 2);
    });

    this.readout = (typeof readout == typeof '') ?
      new Readout(this.root.querySelector(readout)) :
      readout;
    this.controls = (typeof controls == typeof '') ?
      new Controls(controls) :
      controls;
    this.controls.addCanvas(this.canvas, this.root);
    this.viewport = viewport;
    this.world = world;
  }

  run () {
    let lastTransform = this.controls.userTransform;
    this.viewport.userTransform = lastTransform;
    const mainLoop = (time) => {
      if (this.timer == null) {
        // Begin
        this.timer = new Timer(time);
      } else if (this.controls.paused) {
        // Pause
        this.timer.pause();
      } else if (this.timer.paused) {
        // Unpause
        this.timer.unpause(time);
      } else {
        // Business as usual
        this.timer.update(time);
      }

      const transform = this.controls.userTransform;
      const transformChanged = !transform.equals(lastTransform);
      if (transformChanged || !this.viewport.leaveTrails) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      if (transformChanged) {
        this.viewport.userTransform = transform;
        lastTransform = transform;
      }

      if (this.controls.speed != 0 &&
          !this.controls.paused &&
          this.timer.delta > 0) {
        this.world.update(
            this.timer.delta * this.controls.speed,
            this.controls.stepSize);
      }
      if (this.readout != undefined) {
        this.readout.update(this.world);
      }
      this.viewport.draw(this.context, this.world, this.bounds, this.canvasCenter);

      window.requestAnimationFrame(mainLoop);
    }
    window.requestAnimationFrame(mainLoop);
    return this;
  }
}
