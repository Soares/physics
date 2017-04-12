class WorldItem {
  initialize (world) { }
  populate () { }
  update (dt, epsilon) { }
  transform (...args) { }
}


class ThreeWorld {
  constructor (elem, {
    origin = new THREE.Vector3(0, 0, 0),
    originToViewpoint = new THREE.Vector3(0, 0, 100),
    orthographic = false,
    speed = 1,  // in-world seconds per second
    fidelity = 1000,  // updates per sidereal second
    controlElem = '#controls',
  } = {}, ...items) {
    this.origin = origin;
    this.originToViewpoint = originToViewpoint;
    this.orthographic = orthographic;

    this.container = typeof elem == typeof '' ? document.querySelector(elem) : elem;
    this.scene = this.makeScene();
    this.renderer = this.makeRenderer();
    this.camera = this.makeCamera(this.container.scrollWidth, this.container.scrollHeight);
    this.threeControls = this.makeControls();
    this.htmlControls = new Controls(controlElem, speed, fidelity);
    this.timer = null;
    this.paused = false;

    this.container.appendChild(this.renderer.domElement);
    const onWindowResize = () => {
      this.camera.aspect = this.container.scrollWidth / this.container.scrollHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.scrollWidth, this.container.scrollHeight);
    }
    window.addEventListener('optimizedResize', onWindowResize, false);
    onWindowResize();

    this.items = items;
    for (let item of this.items) {
      item.populate(this);
    }
  }

  add (item) {
    item.populate(this);
    this.items.push(item);
    return this;
  }

  // Produce a properly initialized THREE scene.
  // The default one is vanilla.
  makeScene () { return new THREE.Scene(); }

  // Produce a properly initialized THREE renderer.
  // The default one has the pixel ratio and set to the devicePixelRatio and
  // the width and height set to the container width and height.
  makeRenderer () {
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.container.scrollWidth, this.container.scrollHeight);
    return renderer;
  }

  // Produce a property initialized THREE camera.
  // The default one is a perspective camera with the appropriate axpect ratio
  // with near/far plates at 1 and 1000.
  makeCamera (width, height) {
    let camera = null;
    if (this.orthographic) {
      camera = new THREE.OrthographicCamera(
          width / - 2,
          width / 2,
          height / 2,
          height / - 2,
          1, 10000);
      camera.zoom = 4;
    } else {
      const aspectRatio = width / height;
      camera = new THREE.PerspectiveCamera(60, aspectRatio, 1, 10000);
    }
    const viewpoint = this.origin.clone().add(this.originToViewpoint);
    camera.position.x = viewpoint.x;
    camera.position.y = viewpoint.y;
    camera.position.z = viewpoint.z;
    return camera;
  }

  // Produce a properly initialized THREE controller.
  // The default one is an OrbitControls with .eou instead of wsad for position
  // control, because I'm a Dvorak user who likes his hands on the home row.
  makeControls () {
    const controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    controls.keys = { LEFT: 79, UP: 190, RIGHT: 85, BOTTOM: 69 };
    controls.keyPanSpeed = 30;
    return controls;
  }

  update (dt, epsilon) {
    this.threeControls.update();
    for (let item of this.items) {
      item.update(dt, epsilon);
    }
    return this;
  }

  render () {
    this.renderer.render(this.scene, this.camera);
    return this;
  }

  tick () {
    this.update(this.htmlControls.speed, this.htmlControls.stepSize);
  }

  transform (...args) {
    for (let item of this.items) {
      item.transform(...args);
    }
  }

  run () {
    const mainLoop = (time) => {
      if (this.timer == null) {
        // Begin
        this.timer = new Timer(time);
      } else if (this.htmlControls.paused) {
        // Pause
        this.timer.pause();
      } else if (this.timer.paused) {
        // Unpause
        this.timer.unpause(time);
      } else {
        // Business as usual
        this.timer.update(time);
      }

      if (this.htmlControls.speed != 0 && !this.htmlControls.paused && this.timer.delta > 0) {
        this.update(this.timer.delta * this.htmlControls.speed, this.htmlControls.stepSize);
      }
      this.render();
      window.requestAnimationFrame(mainLoop);
    }
    window.requestAnimationFrame(mainLoop);
  }

  addWaveVisualization (vector, universe, options={}) {
    const cls = (vector instanceof FVector) ? FVectorViz : CVectorViz;
    const visualizer = new cls(vector, universe, options, this);
    this.add(visualizer);
    return visualizer;
  };
}
