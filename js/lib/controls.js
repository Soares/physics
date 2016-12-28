class Controls {
  constructor(root, initialSpeed = 1, initialZoom = 1, initialFidelity = 1000) {
    this.root = (typeof root == typeof '') ? document.querySelector(root) : root;

    // Apologies for the code duplication.
    this.speedSlider = this.root.querySelector('input.speed-slider');
    this.speedManual = this.root.querySelector('input.speed-manual');
    if (this.speedManual) {
      this.speedSlider.addEventListener('input', (event) => {
        this.speedManual.value = this.speedSlider.value;
      });
      this.speedManual.addEventListener('input', (event) => {
        this.speedSlider.value = this.speedManual.value;
      });
      this.speedManual.value = initialSpeed;
      this.speedSlider.value = initialSpeed;
    } else {
      this.initialSpeed = initialSpeed;
    }

    this.pauseButton = this.root.querySelector('button.pause');
    this.pauseButton.addEventListener('click', (event) => {
      this.root.classList.add('paused');
      this._paused = true;
    });
    this.unpauseButton = this.root.querySelector('button.unpause');
    this.unpauseButton.addEventListener('click', (event) => {
      this.root.classList.remove('paused');
      this._paused = false;
      this.runners.forEach((r) => r.run());
    });

    this.fidelitySlider = this.root.querySelector('input.fidelity-slider');
    this.fidelityManual = this.root.querySelector('input.fidelity-manual');
    if (this.fidelityManual) {
      this.fidelitySlider.addEventListener('input', (event) => {
        this.fidelityManual.value = this.fidelitySlider.value;
      });
      this.fidelityManual.addEventListener('input', (event) => {
        this.fidelitySlider.value = this.fidelityManual.value;
      });
      this.fidelityManual.value = initialFidelity;
      this.fidelitySlider.value = initialFidelity;
    } else {
      this.initialFidelity = initialFidelity;
    }

    this.zoomSlider = this.root.querySelector('input.zoom-slider');
    this.zoomManual = this.root.querySelector('input.zoom-manual');
    if (this.zoomManual) {
      this.zoomSlider.addEventListener('input', (event) => {
        this.zoomManual.value = this.zoomSlider.value;
        this._userTransform = null;
      });
      this.zoomManual.addEventListener('input', (event) => {
        this.zoomSlider.value = this.zoomManual.value;
        this._userTransform = null;
      });
      this.zoomManual.value = initialZoom;
      this.zoomSlider.value = initialZoom;
    } else {
      this.initialZoom = initialZoom;
    }

    this.angleSlider = this.root.querySelector('input.angle-slider');
    this.angleManual = this.root.querySelector('input.angle-manual');
    if (this.angleManual) {
      this.angleSlider.addEventListener('input', (event) => {
        this.angleManual.value = this.angleSlider.value;
        this._userTransform = null;
      });
      this.angleManual.addEventListener('input', (event) => {
        this.angleSlider.value = this.angleManual.value;
        this._userTransform = null;
      });
      this.angleManual.value = 0;
      this.angleSlider.value = 0;
    }

    this.runners = [];
    this.userTranslate = Vector2.zero;
    this._userTransform = null;
  }
  
  addRunner (r) {
    this.runners.push(r);
  }

  // 'container' is the element you have to mouse out of to drop the canvas if
  // you were dragging it.
  addCanvas (canvas, container = canvas) {
    let isDragging = false;
    let prevDragLocation = null;
    canvas.addEventListener('mousedown', (event) => {
      isDragging = true;
      prevDragLocation = new Vector2(event.clientX, event.clientY);
    });
    canvas.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const newLocation = new Vector2(event.clientX, event.clientY);
        this.userTranslate = this.userTranslate.add(newLocation.sub(prevDragLocation));
        this._userTransform = null;
        prevDragLocation = newLocation;
      }
    });
    container.addEventListener('mouseup', (event) => {
      isDragging = false;
      prevDragLocation = null;
    });
    container.addEventListener('mouseout', (event) => {
      if (!container.contains(event.relatedTarget)) {
        isDragging = false;
        prevDragLocation = null;
      }
    });
  }

  _numberFromInput (input, missing, error = missing) {
    if (input != null) {
      const num = parseFloat(input.value);
      return Number.isNaN(num) ? error : num;
    }
    return missing;
  }


  get paused () { return this._paused; }
  get speed () {
    return this._numberFromInput(this.speedManual, this.initialSpeed, 0);
  }
  get stepsPerSecond () {
    return this._numberFromInput(this.fidelityManual, this.initialFidelity, 1);
  }
  get zoom () {
    return this._numberFromInput(this.zoomManual, this.initialZoom, 1);
  }
  get angle () { return this._numberFromInput(this.angleManual, 0); }
  get stepSize () { return 1 / this.stepsPerSecond; }
  get userTransform () {
    if (this._userTransform == null) {
      this._userTransform = new AffineTransform2(
          Matrix2x2.rotation(this.angle, this.zoom),
          this.userTranslate);
    }
    return this._userTransform;
  }
};
