class Grid {
  // Config takes:
  // gridWidth: grid line width in pixels. Default 1.
  // axisWidth: axis line width in pixels. Default 2.
  // color: r, g, b tuple. Default [0, 0, 0].
  // gridOpacity: grid opacity from 0 to 1. Default 0.1.
  // axisOpacity: 3x the grid opacity if unspecified.
  // tickHeight: 5x the axisWidth if unspecified.
  // transform: (time) => AffineTransform2. Trivial if unspecified.
  constructor (xTickSpacing = 1, yTickSpacing = null, config = {}) {
    this.xTickSpacing = xTickSpacing;
    this.yTickSpacing = yTickSpacing == null ? xTickSpacing : yTickSpacing;
    this.gridWidth = config.gridWidth == null ? 1 : config.gridWidth;
    this.axisWidth = config.axisWidth == null ? 2 : config.axisWidth;
    this._color = config.color == null ? [0, 0, 0] : config.color;
    this._gridOpacity = config.gridOpacity == null ? 0.1 : config.gridOpacity;
    this._axisOpacity = config.axisOpacity == null ?
      Math.min(1, 3 * this._gridOpacity) :
      config.axisOpacity;
    this.tickHeight = config.tickHeight == null ?
      5 * this.axisWidth :
      config.tickHeight;
    this.transform = config.transform;
  }

  static _rgba (r, g, b, a) { return `rgba(${r}, ${g}, ${b}, ${a})`; }
  get gridColor () { return Grid._rgba(...this._color, this._gridOpacity); }
  get axisColor () { return Grid._rgba(...this._color, this._axisOpacity); }

  draw (context, params) {
    let worldOrigin = Vector2.zero;
    let worldX = Vector2.unitX;
    let worldY = Vector2.unitY;
    if (this.transform) {
      const transform = this.transform(params.time);
      worldOrigin = transform.b;
      worldX = transform.M.apply(worldX);
      worldY = transform.M.apply(worldY);
    }
    const origin = params.translatePoint(worldOrigin);
    let xTick = params.translateVector(worldX).scale(this.xTickSpacing);
    let yTick = params.translateVector(worldY).scale(this.yTickSpacing);
    // Here be some arbitrary magic numbers to make grids and axes look decent
    // when you zoom out a bunch.
    if (xTick.r > 5.1 && yTick.r > 5.1) {
      new Grid2D(origin, xTick, yTick, this.gridWidth)
        .draw(context, params.bounds, this.gridColor);
    }
    if (xTick.rSquared < 50**2 && yTick.rSquared < 50**2) {
      const scalar = Math.sqrt(Math.min(xTick.rSquared, yTick.rSquared));
      xTick = xTick.scale(50 / scalar);
      yTick = yTick.scale(50 / scalar);
    }
    new Axes2D(origin, xTick, yTick, this.axisWidth, this.tickHeight)
      .draw(context, params.bounds, this.axisColor);
  }

  genConfig () {
    return {
      gridWidth: this.gridWidth,
      axisWidth: this.axisWidth,
      color: this._color,
      gridOpacity: this._gridOpacity,
      axisOpacity: this._axisOpacity,
      tickHeight: this.tickHeight,
      transform: this.transform,
    };
  }

  withColor (color, gridOpacity = null, axisOpacity = null) {
    const config = this.genConfig();
    if (color != null) { config.color = color; }
    if (gridOpacity != null) { config.gridOpacity = gridOpacity; }
    if (axisOpacity != null) { config.axisOpacity = axisOpacity; }
    return new Grid(this.xTickSpacing, this.yTickSpacing, config);
  }

  withTransform (transform) {
    const config = this.genConfig();
    config.transform = transform;
    return new Grid(this.xTickSpacing, this.yTickSpacing, config);
  }
}

Grid.black = [0, 0, 0];
Grid.white = [1, 1, 1];
Grid.red = [255, 0, 0];
Grid.green = [0, 255, 0];
Grid.blue = [0, 0, 255];
Grid.cyan = [0, 255, 255];
Grid.magenta = [255, 0, 255];
Grid.yellow = [255, 255, 0];
