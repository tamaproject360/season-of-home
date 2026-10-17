export class PetSystem {
  constructor(state, clock) { this.state = state; this.clock = clock; }

  pet() {
    if (this.state.lastPettedDay === this.clock.day) return { success: false, message: 'Kiko sudah dielus hari ini.' };
    this.state.lastPettedDay = this.clock.day;
    this.state.affection = Math.min(100, this.state.affection + 3);
    return { success: true, message: 'Kiko senang! +3 afeksi.' };
  }

  toggleFollow() {
    this.state.mode = this.state.mode === 'following' ? 'resting' : 'following';
    return this.state.mode;
  }
}
