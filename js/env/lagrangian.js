class LagrangianVisualization extends WorldItem {
  constructor ({
    L = (x, v, t) => v**2 - x,
    timeCells = null,
    positionCells = range(100, -50),
    velocityCells = positionCells,
    initialViewpoint = new THREE.Vector3(0, 0, 0),
    bounds = null,
    xStart = null,
    xEnd = null,
    dotSize = 2,
    pointOpacity = null,
    scale = [1, 1, 1],
    center = new THREE.Vector3(0, 0, timeCells == null ? 0 : timeCells[parseInt(timeCells.length/2)] * scale[2]),
    curves = [],
    orthographic = false,
  } = {}) {
    super();
    this.timeCells = timeCells;
    this.positionCells = positionCells;
    this.velocityCells = velocityCells;
    this.center = center;
    this.initialViewpoint = initialViewpoint;
    this.L = L;
    this.xStart = xStart;
    this.xEnd = xEnd;
    this.dotSize = dotSize;

    this.minL = Infinity;
    this.maxL = -Infinity;
    for (let x of this.positionCells) {
      for (let v of this.velocityCells) {
        const Lqv = this.L(x, v);
        this.minL = Math.min(this.minL, Lqv);
        this.maxL = Math.max(this.maxL, Lqv);
      }
    }

    this.scale = scale;
    this.curves = curves;
    this.pointOpacity = pointOpacity;
  }

  heatColor (n, lightness = 50, {
    hue = [270, 0],
    saturation = [100, 100],
    range = null,
  } = {}) {
    range = (range == null) ? [this.minL, this.maxL] : range;
    const p = (n - range[0]) / (range[1] - range[0]);
    const h = (p * (hue[1] - hue[0])) + hue[0];
    const s = (p * (saturation[1] - saturation[0])) + saturation[0];
    const l = lightness;
    return new THREE.Color().setHSL(h / 360, s / 100, l / 100);
  }

  translateXVT (x, v, t) {
    return new THREE.Vector3(x * this.scale[0], v * this.scale[1], t * this.scale[2]);
  }
  
  translateXVL (x, v, L) {
    return new THREE.Vector3(x * this.scale[0], v * this.scale[1], L * this.scale[2]);
  }

  populate (world) {
    const pointsMaterial = new THREE.PointsMaterial({
      vertexColors: THREE.VertexColors,
      size: this.dotSize,
    });
    if (world.orthographic) {
      pointsMaterial.sizeAttenuation = false;
    }
    if (this.pointOpacity == null) {
      if (this.timeCells != null && this.timeCells.length  > 1) {
        pointsMaterial.transparent = true;
        pointsMaterial.opacity = 0.5;
      }
    } else if (this.pointOpacity != false) {
      pointsMaterial.transparent = true;
      pointsMaterial.opacity = this.pointOpacity;
    }

    this.pointsGeometry = new THREE.Geometry();
    for (let x of this.positionCells) {
      for (let v of this.velocityCells) {
        const L = this.L(x, v, 0);
        if (this.timeCells == null) {
          let lightness = 50;
          if (x == this.xStart) {
            lightness = 15;
          } else if (x == this.xEnd) {
            lightness = 85;
          }
          const color = this.heatColor(L, lightness);
          this.pointsGeometry.vertices.push(this.translateXVL(x, v, L));
          this.pointsGeometry.colors.push(color);
        } else {
          for (let t of this.timeCells) {
            let lightness = 50;
            if (t == this.timeCells[0] && x == this.xStart) {
              lightness = 15;
            } else if (t == last(this.timeCells) && x == this.xEnd) {
              lightness = 85;
            }
            const color = this.heatColor(L, lightness);
            this.pointsGeometry.vertices.push(this.translateXVT(x, v, t));
            this.pointsGeometry.colors.push(color);
          }
        }
      }
    }
    world.scene.add(new THREE.Points(this.pointsGeometry, pointsMaterial));
    world.scene.add(new THREE.AxisHelper(5));
    const translator = (x, v, t) => this.translateXVT(x, v, t);  // Silly js binding.
    for (let curve of this.curves) {
      world.scene.add(curve.makeObject(this.timeCells, translator));
    }
  }
}

class Curve {
  constructor (fn, options) {
    this.fn = fn;
    this.color = (options.color === undefined) ? 0x000000 : options.color;
    delete options.color;
    this.dashed = (options.dashed === undefined) ? false : options.dashed;
    delete options.dashed;
    this.materialOpts = options;
  }

  makeObject (timeCells, translator) {
    const materialClass = this.dashed ? THREE.LineDashedMaterial : THREE.LineBasicMaterial;
    if (this.color instanceof Function) {
      // Line segments
      const mOpts = Object.assign({vertexColors: THREE.VertexColors}, this.materialOpts);
      const material = new materialClass(mOpts);
      const geometry = new THREE.Geometry();
      let first = true;
      let point, color;
      for (let t of timeCells) {
        const [x, v] = this.fn(t);
        point = translator(x, v, t);
        color = this.color(t);
        geometry.vertices.push(point);
        geometry.vertices.push(color);
        if (first) {
          first = false;
        } else {
          geometry.vertices.push(point);
          geometry.vertices.push(color);
        }
      }
      geometry.vertices.push(point);
      geometry.vertices.push(color);
      return new THREE.LineSegments(geometry, material);
    } else {
      // Single line
      const mOpts = Object.assign({color: this.color}, this.materialOpts);
      const material = new materialClass(mOpts);
      const geometry = new THREE.Geometry();
      for (let t of timeCells) {
        const [x, v] = this.fn(t);
        geometry.vertices.push(translator(x, v, t));
      }
      return new THREE.Line(geometry, material);
    }
  }
}

const k = 0.25;
const t_bump = 2;
const bump_width = 0.5;
const bump_height = 4;
const eta = (t) => {
  const d = t - t_bump;
  if (Math.abs(d) < bump_width) {
    return bump_height * Math.exp(-1/(1-d**2));
  }
  return 0;
}
const etadot = (t) => {
  const d = t - t_bump;
  if (Math.abs(d) < bump_width) {
    return -bump_height * (2 * Math.exp(1/(d**2 - 1)) * d) / ((1 - d**2)**2);
  }
  return 0;
}


const L = new LagrangianVisualization({
  L: (x, v, t) => (0.1 * v**2) + (x),
  timeCells: range(10, 0, 2),
  positionCells: range(51, -25),
  velocityCells: range(51, -25),
  xStart: -3,
  xEnd: 10,
});
new ThreeWorld('#root', {orthographic: false}, L).animate();
