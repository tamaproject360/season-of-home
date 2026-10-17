/**
 * WorldClock
 * 1 game day = 10 minutes real time (600 seconds).
 * Morning starts at 06:00 (360 minutes), Evening starts at 18:00 (1080 minutes).
 * Manages calendar, seasons, deterministic weather, and time freeze during modals.
 */

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
export const DAYS_PER_SEASON = 7;
export const REAL_SECONDS_PER_GAME_DAY = 600; // 10 minutes
export const GAME_MINUTES_PER_DAY = 1440; // 24 hours * 60 minutes
export const MINUTES_PER_REAL_SECOND = GAME_MINUTES_PER_DAY / REAL_SECONDS_PER_GAME_DAY; // 2.4 game minutes per real sec

export class WorldClock {
  constructor(initialDay = 1, initialSeason = 'spring') {
    this.day = initialDay;
    this.season = initialSeason;
    this.seasonIndex = Math.max(0, SEASONS.indexOf(initialSeason));
    
    // Start at 06:00 AM (360 game minutes)
    this.timeMinutes = 360;
    this.lastEmittedHour = 6;
    this.isFrozen = false;
    
    this.weather = this.computeWeather(this.day);

    this.listeners = {
      tick: [],
      hour: [],
      day: []
    };
  }

  /**
   * Deterministic pseudo-random weather based on day number
   */
  computeWeather(day) {
    // Simple LCG pseudo-random generator
    const seed = (day * 9301 + 49297) % 233280;
    const rnd = seed / 233280.0;
    if (rnd < 0.20) return 'rain';
    if (rnd < 0.45) return 'cloudy';
    return 'clear';
  }

  freeze() {
    this.isFrozen = true;
  }

  unfreeze() {
    this.isFrozen = false;
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    };
  }

  emit(event, ...args) {
    if (!this.listeners[event]) return;
    for (const cb of this.listeners[event]) {
      try {
        cb(...args);
      } catch (err) {
        console.error(`[WorldClock] Error in ${event} callback:`, err);
      }
    }
  }

  update(deltaSeconds) {
    if (this.isFrozen) return;

    // Advance time
    const minutesToAdd = deltaSeconds * MINUTES_PER_REAL_SECOND;
    this.timeMinutes += minutesToAdd;

    const currentHour = Math.floor(this.timeMinutes / 60);
    if (currentHour !== this.lastEmittedHour && currentHour < 24) {
      this.lastEmittedHour = currentHour;
      this.emit('hour', currentHour);
    }

    // Auto-sleep if past 02:00 AM (26 hours = 1560 minutes or pass midnight 24:00)
    if (this.timeMinutes >= 1440) {
      this.advanceToMorning();
    } else {
      this.emit('tick', this.getTimeString());
    }
  }

  /**
   * Sleep / Advance to next morning at 06:00 AM
   */
  advanceToMorning() {
    this.day++;
    
    // Check season transition
    const seasonProgress = Math.floor((this.day - 1) / DAYS_PER_SEASON);
    this.seasonIndex = seasonProgress % SEASONS.length;
    this.season = SEASONS[this.seasonIndex];

    this.timeMinutes = 360; // 06:00 AM
    this.lastEmittedHour = 6;
    this.weather = this.computeWeather(this.day);

    console.log(`[WorldClock] Day advanced: Day ${this.day}, Season: ${this.season}, Weather: ${this.weather}`);
    this.emit('day', {
      day: this.day,
      season: this.season,
      weather: this.weather
    });
    this.emit('tick', this.getTimeString());
  }

  getHour() {
    return Math.floor(this.timeMinutes / 60);
  }

  getMinute() {
    return Math.floor(this.timeMinutes % 60);
  }

  getTimeString() {
    const hh = String(this.getHour()).padStart(2, '0');
    const mm = String(this.getMinute()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  isNight() {
    const h = this.getHour();
    return h >= 18 || h < 6;
  }

  getState() {
    return {
      day: this.day,
      season: this.season,
      timeMinutes: this.timeMinutes,
      weather: this.weather
    };
  }

  loadState(state) {
    if (!state) return;
    this.day = state.day || 1;
    this.season = state.season || 'spring';
    this.seasonIndex = Math.max(0, SEASONS.indexOf(this.season));
    this.timeMinutes = state.timeMinutes !== undefined ? state.timeMinutes : 360;
    this.lastEmittedHour = Math.floor(this.timeMinutes / 60);
    this.weather = state.weather || this.computeWeather(this.day);
    this.emit('day', {
      day: this.day,
      season: this.season,
      weather: this.weather
    });
  }
}
