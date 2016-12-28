class FlowingParticles extends WorldItem {
  constructor () {
    super();
    this.radius = new THREE.Vector3(50, 50, 50);
    this.maxTime = 12;
    this.timeScale = 1;
    // x is position. y is velocity. z is time.
    this.granularity = new THREE.Vector3(100, 100, 12);
  }

  populate (world) {
    this.pointsGeometry = new THREE.Geometry();
    this.trajectories = [];
    for (let q = 0; q < this.granularity.x; q++) {
      for (let v = 0; v < this.granularity.y; v++) {
        for (let t = 0; t < this.granularity.z; t++) {
          const noise = this.noise();
          const traj = {
            qCell: q + noise.x,
            vCell: v + noise.y,
            tCell: t + noise.z
          };
          const [q0, v0] = this.phasePoint(traj.qCell, traj.vCell, traj.tCell);
          const [x, y, z] = this.translate(q0, v0, traj.tCell);
          const point = new THREE.Vector3(x, y, z);
          traj.point = point;
          this.trajectories.push(traj);
          this.pointsGeometry.vertices.push(point);
        }
      }
    }
    this.pointsMaterial = new THREE.PointsMaterial({
      color: 0x0000FF,
      opacity: 0.7,
      size: 0.5,
      transparent: true,
    });
    this.points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
    world.scene.add(this.points);
  }

  update (timer) {
    const dt = timer.total * this.timeScale;
    this.trajectories.forEach((j) => {
      const t = (j.tCell + dt) % this.maxTime;
      const [qt, vt] = this.phasePoint(j.qCell, j.vCell, t);
      [j.point.x, j.point.y, j.point.z] = this.translate(qt, vt, t);
    });
    this.pointsGeometry.verticesNeedUpdate = true;
  }

  translate (p, v, t) {
    const x = (p * this.radius.x / this.granularity.x) - (this.radius.x / 2);
    const y = (v * this.radius.y / this.granularity.y) - (this.radius.y / 2);
    const z = (t * this.radius.z / this.granularity.z) - (this.radius.z / 2);
    return [x, y, z];
  }

  phasePoint (x0, v0, t) {
    return [x0 + 10 * Math.sin(t), v0 + 10 * Math.cos(t)];
    // return [x0 + (v0 * t), v0];
  }

  noise () {
    return new THREE.Vector3(0, 0, Math.random());
    // return new THREE.Vector3();
  }
}

const flowers = new FlowingParticles();
new ThreeWorld('#root', {}, flowers).animate();
