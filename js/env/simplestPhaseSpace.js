class ParticleWorld extends ThreeWorld {
  initialize ({
    timeScale = 10,
    timeCells = range(100, 0),
    timeTrackerCells = range(2, 0, 25),
    positionCells = range(25, -14),
    velocityCells = positionCells,
    center = new THREE.Vector3(0, 0, 0),
    law = (q0, v0, t) => [q0 + t * v0, v0],
    initialViewpoint = new THREE.Vector3(0, 0, -30),
  } = {}) {
    this.timeScale = timeScale;
    this.timeCells = timeCells;
    this.timeTrackerCells = timeTrackerCells;
    this.positionCells = positionCells;
    this.velocityCells = velocityCells;
    this.center = center;
    this.initialViewpoint = initialViewpoint;
    this.law = law;
  }

  proj (q, v, t) { return [q, v, t]; }
  color (q, v, t) {
    return [
      sigmoid(q / 100),
      sigmoid(v / 10),
      sigmoid(t / 10),
    ];
  }

  makeCamera (width, height) {
    const camera = super.makeCamera(width, height);
    camera.position.x = this.initialViewpoint.x;
    camera.position.y = this.initialViewpoint.y;
    camera.position.z = this.initialViewpoint.z;
    return camera;
  }

  makeControls () {
    const controls = super.makeControls();
    controls.target.x = this.center.x;
    controls.target.y = this.center.y;
    controls.target.z = this.center.z;
    return controls;
  }

  populate () {
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
    });
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x000000,
      size: 0.5,
    });
    this.pointsGeometry = new THREE.Geometry();
    this.pointTrajectories = [];
    for (let q0 of this.positionCells) {
      for (let v0 of this.velocityCells) {

        // The trajectory line
        const lineGeometry = new THREE.Geometry();
        let first = true;
        let start, color;
        for (let t of this.timeCells) {
          start = new THREE.Vector3(...this.proj(...this.law(q0, v0, t), t));
          color = new THREE.Color(...this.color(start.x, start.y, start.z));
          lineGeometry.vertices.push(start);
          lineGeometry.colors.push(color);
          if (first) {
            first = false;
          } else {
            lineGeometry.vertices.push(start);
            lineGeometry.colors.push(color);
          }
        }
        lineGeometry.vertices.push(start);
        lineGeometry.colors.push(color);
        this.scene.add(new THREE.LineSegments(lineGeometry, lineMaterial));

        // The travelling points
        for (let t0 of this.timeTrackerCells) {
          const point = this.proj(...this.law(q0, v0, t0), t0);
          const color = this.color(...point);
          const trajectory = {
            q0, v0, t0,
            point: new THREE.Vector3(...point),
            color: new THREE.Color(...color),
          };
          this.pointTrajectories.push(trajectory);
          this.pointsGeometry.vertices.push(trajectory.point);
        }
      }
    }
    this.scene.add(new THREE.Points(this.pointsGeometry, pointsMaterial));
    this.scene.add(new THREE.AxisHelper(5));
  }

  update (timer) {
    if (this.timeScale == 0) { return; }
    const elapsedTime = timer.total * this.timeScale;
    const firstTime = this.timeCells[0];
    const lastTime = this.timeCells[this.timeCells.length - 1];
    const timeDirection = Math.sign(lastTime - firstTime);
    const maxTimeDifference = Math.abs(lastTime - firstTime);
    this.pointTrajectories.forEach((j) => {
      const clampedTimeDifference = (j.t0 + elapsedTime) % maxTimeDifference;
      const t = firstTime + timeDirection * clampedTimeDifference;
      const [q, v] = this.law(j.q0, j.v0, t);
      j.point.set(...this.proj(q, v, t));
    });
    this.pointsGeometry.verticesNeedUpdate = true;
  }
}

const W = new ParticleWorld('#root', {
  law: (q0, v0, t) => [q0 + v0 * t + 0.5 * t**2, v0 + t],
  positionCells: range(20, -10, 1/10),
  velocityCells: [-5, 0, 5],
  timeCells: range(100, -5, 1/8),
  timeScale: 0,
  timeTrackerCells: range(3),
}).animate();