class VectorFieldVisualizer extends WorldItem {
  constructor (F, {
    origin = new THREE.Vector3(50, 50, 50),
    scale = new THREE.Vector3(10, 10, 10),
    xrange = range(20, -10, 1),
    yrange = range(20, -10, 1),
    zrange = range(20, -10, 1),
    bodyColor = 0x0000FF,
    headColor = 0xFF00FF,
    tailColor = 0x000000,
    thickness = 3,
    noisy = false,
  } = {}) {
    super();
    this.F = F;
    this.origin = origin;
    this.scale = scale;
    this.xrange = xrange;
    this.yrange = yrange;
    this.zrange = zrange;
    this.bodyColor = bodyColor;
    this.headColor = headColor;
    this.tailColor = tailColor;
    this.thickness = thickness;
    this.noisy = noisy;
  }

  populate (world) {
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

    world.scene.add(this.bodies);
    world.scene.add(this.heads);
    world.scene.add(this.tails);
  }

  noise () {
    return new THREE.Vector3(Math.random(), Math.random(), Math.random());
  }
}


class ScalarFieldVisualizer extends WorldItem {
  constructor (S, {
    origin = new THREE.Vector3(50, 50, 50),
    scale = new THREE.Vector3(10, 10, 10),
    xrange = range(20, -10, 1),
    yrange = range(20, -10, 1),
    zrange = range(20, -10, 1),
    minmax = [0, 100],
    pointSize = 5,
    noisy = false,
  } = {}) {
    super();
    this.S = S;
    this.origin = origin;
    this.scale = scale;
    this.xrange = xrange;
    this.yrange = yrange;
    this.zrange = zrange;
    this.minmax = minmax;
    this.pointSize = pointSize;
    this.noisy = noisy;
  }

  heatColor (n, lightness = 50, {
    hue = [270, 0],
    saturation = [100, 100],
    range = null,
  } = {}) {
    range = (range == null) ? this.minmax : range;
    const p = ((n - range[0]) / (range[0] - range[1]));  // big = hot
    const h = (p * (hue[1] - hue[0])) + hue[0];
    const s = (p * (saturation[1] - saturation[0])) + saturation[0];
    const l = lightness;
    return new THREE.Color().setHSL(h / 360, s / 100, l / 100);
  }

  populate (world) {
    this.geometry = new THREE.Geometry();
    for (let x of this.xrange) {
      for (let y of this.yrange) {
        for (let z of this.zrange) {
          const xyz = new THREE.Vector3(x, y, z);
          if (this.noisy) {
            xyz.add(this.noise());
          }
          this.geometry.colors.push(this.heatColor(this.S(xyz.x, xyz.y, xyz.z)));
          this.geometry.vertices.push(xyz.multiply(this.scale).add(this.origin));
        }
      }
    }
    this.material = new THREE.PointsMaterial({
      vertexColors: THREE.VertexColors,
      size: this.pointSize,
      opacity: 0.5,
      transparent: true,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    world.scene.add(this.points);
  }

  noise () {
    return new THREE.Vector3(Math.random(), Math.random(), Math.random());
  }
}
