class AxisHelper extends WorldItem {
  constructor (scale=1) {
    super();
    this.scale = scale;
  }

  populate (world) {
    world.scene.add(new THREE.AxisHelper(this.scale));
  }
}


class CVectorViz extends WorldItem {
  constructor (psi, U, {
    scale=[2, 10, 10],
    origin=[0, 0, 0],
    timeScale=1,  // in addition to the one set by the user
    dotScale=3,
    color=[1, 0, 1],
    drawSurface=false,
    transformer=false,
    isProxy=false,
  } = {}, owner=null) {
    super();
    this.psi = psi;
    this.U = U;
    this.timeScale = timeScale;
    this.dotScale = dotScale;
    this.scale = Array.isArray(scale) ? new THREE.Vector3(...scale) : scale;
    this.origin = Array.isArray(origin) ? new THREE.Vector3(...origin) : origin;
    this.color = Array.isArray(color) ? new THREE.Color(...color) : color;
    this.drawSurface = drawSurface;
    this.transformer = transformer;
    this.isProxy = isProxy;
    this.owner = owner;
  }

  options (overrides={}) {
    const opts = {
      scale: this.scale.clone(),
      origin: this.origin.clone(),
      timeScale: this.timeScale,
      dotScale: this.dotScale,
      color: this.color,
      drawSurface: this.drawSurface,
      transformer: this.transformer,
      isProxy: this.isProxy,
    };
    for (let key in overrides) {
      opts[key] = overrides[key];
    }
    return opts;
  }

  pt (x, y, z) {
    return new THREE.Vector3(x, y, z).multiply(this.scale).add(this.origin);
  }

  endpoints () {
    return [-this.psi.dim / 2, (this.psi.dim / 2) - 1];
  }

  linepoint (i) {
    return i - this.psi.dim / 2;
  }

  populate (world) {
    const mainAxis = new THREE.Geometry();
    const arrowBodies = new THREE.Geometry();
    const arrowHeads = new THREE.Geometry();
    const arrowJoints = new THREE.Geometry();
    const surface = new THREE.Geometry();

    const [xstart, xend] = this.endpoints();
    mainAxis.vertices.push(this.pt(xstart, 0, 0), this.pt(xend, 0, 0));

    let prev = null;
    this.tips = [];
    for (let i = 0; i < this.psi.dim; i++) {
      const base = this.pt(this.linepoint(i), 0, 0);
      const tip = this.pt(
          this.linepoint(i),
          this.psi.carray.real[i],
          this.psi.carray.imag[i]);
      this.tips.push(tip);
      arrowBodies.vertices.push(base, tip);
      arrowJoints.vertices.push(base);
      arrowHeads.vertices.push(tip);
      if (prev != null) {
        surface.vertices.push(prev, tip);
      }
      prev = tip;
    };

    const mainAxisMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 1,
      transparent: false,
    });
    const arrowBodyMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 2,
      opacity: 0.75,
      transparent: true,
    });
    const arrowJointMaterial = new THREE.PointsMaterial({
      color: 0x000000,
      size: 0.1,
      opacity: 0.75,
      transparent: true,
    });
    const arrowHeadMaterial = new THREE.PointsMaterial({
      color: this.color,
      size: this.dotScale,
      opacity: 0.75,
      transparent: true,
    });
    const surfaceMaterial = new THREE.LineBasicMaterial({
      color: this.color.clone().multiplyScalar(0.5),
      linewidth: 10,
      opacity: 0.75,
      transparent: true,
    });

    this.mainAxis = new THREE.LineSegments(mainAxis, mainAxisMaterial);
    this.arrowBodies = new THREE.LineSegments(arrowBodies, arrowBodyMaterial);
    this.arrowHeads = new THREE.Points(arrowHeads, arrowHeadMaterial);
    this.arrowJoints = new THREE.Points(arrowJoints, arrowJointMaterial);
    this.surface = new THREE.LineSegments(surface, surfaceMaterial);

    world.scene.add(this.mainAxis);
    world.scene.add(this.arrowBodies);
    world.scene.add(this.arrowHeads);
    world.scene.add(this.arrowJoints);
    if (this.drawSurface) {
      world.scene.add(this.surface);
    }
  }

  _markDirty () {
    this.tips.forEach((vec, i) => {
      vec.y = this.psi.carray.real[i] * this.scale.y + this.origin.y;
      vec.z = this.psi.carray.imag[i] * this.scale.z + this.origin.z;
    });
    this.surface.geometry.verticesNeedUpdate = true;
    this.arrowHeads.geometry.verticesNeedUpdate = true;
    this.arrowBodies.geometry.verticesNeedUpdate = true;
  }

  update (dt, epsilon) {
    if (this.timeScale == 0) { return; }
    dt *= this.timeScale;
    this.psi.evolve(this.U, dt, epsilon);
    this._markDirty();
  }

  transform (transformer=this.transformer) {
    if (this.isProxy) {
      transformer = this.transformer;
    }
    if (transformer) {
      this.psi.imitate(transformer.apply(this.psi));
      this._markDirty();
    }
  }

  addAltView (f, options={}) {
    if (options.transformer == null) {
      options.transformer = (psi) => f(master.clone());
    }
    options = this.options(options);
    options.isProxy = true;
    const master = this.psi;
    const proxyU = (state) => state.imitate(f(master.clone()));
    return this.owner.addWaveVisualization(f(master.clone()), proxyU, options);
  }
}


class FVectorViz extends CVectorViz {
  constructor (psi, U, options={}, owner=null) {
    if (options.scale == undefined) { options.scale = [10, 10, 10]; }
    if (options.drawSurface == undefined) { options.drawSurface = true; }
    if (options.dotScale == undefined) { options.dotScale = 0.5; }
    super(psi, U, options, owner);
  }

  pt (x, y, z) {
    return new THREE.Vector3(x, y, z).multiply(this.scale).add(this.origin);
  }

  endpoints () {
    return [this.psi.start, this.psi.stop];
  }

  linepoint (i) {
    return this.psi.x(i);
  }
}
