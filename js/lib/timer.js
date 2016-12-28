const _max_timeskip = 0.1; // maximum number of seconds allowed to pass between frames.

class Timer {
  constructor (time) {
    this._total = 0;
    this._current = time;
    this._previous = time;
    this._paused = false;
  }

  get deltaMilliseconds () { return this._current - this._previous; }
  get delta () { return (this._current - this._previous) / 1000; }
  get totalMilliseconds () { return this._total; }
  get total () { return this.totalMilliseconds / 1000; }
  get paused () { return this._paused; }

  update (time) {
    this._previous = Math.max(this._current, time - 1000 * _max_timeskip);
    this._current = time;
    this._total += this.deltaMilliseconds;
  }

  pause (time) {
    this.update(time);
    this._paused = true;
  }

  unpause (time) {
    this._paused = false;
    this._previous = time;
    this._current = time;
  }
};
