class VectorField extends ThreeWorld {
  initialize (F, {
    origin = new THREE.Vector3(50, 50, 50),
    scale = new THREE.Vector3(10, 10, 10),
    xrange = range(20, -10, 1),
    yrange = range(20, -10, 1),
    zrange = range(20, -10, 1),
    orthographic = false,
    bodyColor = 0x0000FF,
    headColor = 0xFF00FF,
    tailColor = 0x000000,
    thickness = 3,
    noisy = false,
  } = {}) {
    this.F = F;
    this.origin = origin;
    this.scale = scale;
    this.xrange = xrange;
    this.yrange = yrange;
    this.zrange = zrange;
    this.orthographic = orthographic;
    this.bodyColor = bodyColor;
    this.headColor = headColor;
    this.tailColor = tailColor;
    this.thickness = thickness;
    this.noisy = noisy;
  }

  makeCamera (width, height) {
    if (this.orthographic) {
      const camera = new THREE.OrthographicCamera(
          width / - 2,
          width / 2,
          height / 2,
          height / - 2,
          1, 10000);
      camera.zoom = 4;
      return camera;
    } else {
      const camera = super.makeCamera();
      camera.position.x = this.origin.x;
      camera.position.y = this.origin.y;
      camera.position.z = this.origin.z + 50;
      return camera;
    }
  }

  makeControls () {
    const controls = super.makeControls();
    controls.target.x = this.origin.x;
    controls.target.y = this.origin.y;
    controls.target.z = this.origin.z;
    return controls;
  }

  populate () {
    const bodiesGeometry = new THREE.Geometry();
    const headsGeometry = new THREE.Geometry();
    const tailsGeometry = new THREE.Geometry();
    for (let x of this.xrange) {
      for (let y of this.yrange) {
        for (let z of this.zrange) {
          const xyz = new THREE.Vector3(x, y, z);
          if (this.noisy) {
            xyz.add(this.noise());
          }
          const start = xyz.clone().multiply(this.scale).add(this.origin);
          const change = this.F(xyz.x, xyz.y, xyz.z).clone().multiply(this.scale);
          const end = start.clone().add(change);
          tailsGeometry.vertices.push(start);
          bodiesGeometry.vertices.push(start, end);
          headsGeometry.vertices.push(end);
        }
      }
    }
    const bodyMaterial = new THREE.LineBasicMaterial({
      color: this.bodyColor,
      linewidth: this.thickness,
      opacity: 0.5,
      transparent: true,
    });
    const headMaterial = new THREE.PointsMaterial({
      color: this.headColor,
      size: this.thickness,
      opacity: 0.5,
      transparent: true,
    });
    const tailMaterial = new THREE.PointsMaterial({
      color: this.tailColor,
      size: this.thickness / 4,
      opacity: 0.5,
      transparent: true,
    });
    this.bodies = new THREE.LineSegments(bodiesGeometry, bodyMaterial);
    this.heads = new THREE.Points(headsGeometry, headMaterial);
    this.tails = new THREE.Points(tailsGeometry, tailMaterial);

    this.scene.add(this.bodies);
    this.scene.add(this.heads);
    this.scene.add(this.tails);

    // this.pointsGeometry = new THREE.Geometry();
    // for (let x = 0; x < this.granularity.x; x++) {
    //   for (let y = 0; y < this.granularity.y; y++) {
    //     for (let z = 0; z < this.granularity.z; z++) {
    //       const noise = this.noise();
    //       const point = new THREE.Vector3(x + noise.x, y + noise.y, z + noise.z);
    //       this.pointsGeometry.vertices.push(point);
    //     }
    //   }
    // }
    // this.pointsMaterial = new THREE.PointsMaterial({
    //   color: 0x0000FF,
    //   opacity: 0.7,
    //   size: 0.5,
    //   transparent: true,
    // });
    // this.points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
    // this.scene.add(this.points);
  }

  update (timer) {
    // const dt = timer.total * this.timeScale;
    // this.trajectories.forEach((j) => {
    //   const t = (j.tCell + dt) % this.maxTime;
    //   const [qt, vt] = this.phasePoint(j.qCell, j.vCell, t);
    //   [j.point.x, j.point.y, j.point.z] = this.translate(qt, vt, t);
    // });
    // this.pointsGeometry.verticesNeedUpdate = true;
  }

  noise () {
    return new THREE.Vector3(Math.random(), Math.random(), Math.random());
  }
}
