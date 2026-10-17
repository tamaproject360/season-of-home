import assert from 'node:assert/strict';
import { AudioSystem } from '../src/systems/AudioSystem.js';

let created = 0, resumed = 0, closed = 0;
const parameter = () => ({ value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
class FakeAudioContext {
  constructor() { created++; this.state = 'suspended'; this.currentTime = 0; this.destination = {}; }
  async resume() { resumed++; this.state = 'running'; }
  async close() { closed++; this.state = 'closed'; }
  createGain() { return { gain: parameter(), connect() {}, disconnect() {} }; }
  createOscillator() { return { frequency: parameter(), connect() {}, disconnect() {}, start() {}, stop() {} }; }
}
const settings = { masterVolume: 0.5, sfxVolume: 0.4, musicVolume: 0.2 };
const events = new EventTarget();
const audio = new AudioSystem(() => settings, { contextFactory: FakeAudioContext, eventTarget: events });
assert.equal(created, 0, 'no audio context created before a gesture');
assert.equal(audio.play('water'), false, 'game remains silent until audio unlock');
await audio.unlock();
assert.equal(created, 1); assert.equal(resumed, 1);
assert.equal(audio.play('water'), true);
assert.equal(audio.sfxGain.gain.value, 0.4);
assert.equal(audio.masterGain.gain.value, 0.5);
settings.masterVolume = 0;
audio.update(0.1, { moving: true, paused: false });
assert.equal(audio.masterGain.gain.value, 0, 'mute changes the live gain');
assert.equal(audio.play('harvest'), false);
audio.dispose();
assert.equal(closed, 1, 'scene shutdown closes its audio context');
const unsupported = new AudioSystem(() => settings, { contextFactory: null, eventTarget: events });
await unsupported.unlock();
assert.equal(unsupported.play('step'), false);
unsupported.dispose();
console.log('Audio: gesture-only context, safe resume/fallback, live gain/mute and cleanup PASS');
