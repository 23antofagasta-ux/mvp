class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPetVoiceMuted: boolean = false;

  constructor() {
    // Lazily init AudioContext on first interaction
    const savedMute = localStorage.getItem('mvp_sound_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
    const savedPetVoice = localStorage.getItem('mvp_pet_voice_muted');
    if (savedPetVoice !== null) {
      this.isPetVoiceMuted = savedPetVoice === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('mvp_sound_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public togglePetVoice(): boolean {
    this.isPetVoiceMuted = !this.isPetVoiceMuted;
    localStorage.setItem('mvp_pet_voice_muted', String(this.isPetVoiceMuted));
    return this.isPetVoiceMuted;
  }

  public getIsPetVoiceMuted(): boolean {
    return this.isPetVoiceMuted;
  }

  public setPetVoiceMuted(muted: boolean) {
    this.isPetVoiceMuted = muted;
    localStorage.setItem('mvp_pet_voice_muted', String(muted));
  }

  // Melodic Star Award Chime (Lonceng Merdu: C5 -> E5 -> G5 -> C6)
  public playStarChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const startTime = this.ctx!.currentTime + idx * 0.1;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // Warning Buzz for Point Deduction (Dengung Peringatan Lembut: 220Hz -> 180Hz)
  public playDeductBuzz() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, startTime);
    osc.frequency.linearRampToValueAtTime(170, startTime + 0.35);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.45);
  }

  // Triumphant Level Up & MVP Fanfare
  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [392, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const startTime = this.ctx!.currentTime + idx * 0.09;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  }

  // Cute Happy Purr / Chirp for Petting
  public playPurr() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, startTime);
    osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(660, startTime + 0.25);

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.35);
  }

  // Munch / Eat sound
  public playMunch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    [0, 0.12].forEach((offset) => {
      const startTime = this.ctx!.currentTime + offset;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(140, startTime + 0.08);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    });
  }

  // Soap bubble pop sound
  public playBubble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, startTime);
    osc.frequency.exponentialRampToValueAtTime(1200, startTime + 0.08);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  // Correct answer sound for mini-games
  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [659.25, 880]; // E5, A5
    notes.forEach((freq, idx) => {
      const startTime = this.ctx!.currentTime + idx * 0.1;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Wrong answer tone
  public playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, startTime);
    osc.frequency.linearRampToValueAtTime(180, startTime + 0.2);

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.28);
  }

  // Cheerful Pop sound for UI clicks & theme switches
  public playPop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, startTime);
    osc.frequency.exponentialRampToValueAtTime(800, startTime + 0.08);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  // Magical Star Collect Ping with progressive ascending pitch
  public playStarCollect(pitchMultiplier: number = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const baseFreq = 880 * Math.max(0.5, Math.min(2.5, pitchMultiplier));
    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, startTime + 0.12);

    gain.gain.setValueAtTime(0.22, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.25);
  }

  // --- UNIQUE SPECIES HAPPY CHIRPS & VOCALIZATIONS ---

  /**
   * Play unique vocalization / happy chirp for a specific pet species and evolution stage
   */
  public playPetChirp(speciesId: string, stageIndex: number = 0) {
    if (this.isMuted || this.isPetVoiceMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Pitch multiplier: Baby stages are higher & sweeter, adult stages are richer & deeper
    const pitchMul = stageIndex === 0 ? 1.25 : stageIndex === 1 ? 1.15 : stageIndex === 2 ? 1.0 : 0.88;
    const cleanId = (speciesId || '').toLowerCase();

    if (cleanId.includes('kucing') || cleanId.includes('cat')) {
      this.synthesizeCatMeow(pitchMul);
    } else if (cleanId.includes('kelinci') || cleanId.includes('rabbit')) {
      this.synthesizeRabbitChirp(pitchMul);
    } else if (cleanId.includes('shiba') || cleanId.includes('dog') || cleanId.includes('anjing')) {
      this.synthesizeDogYip(pitchMul);
    } else if (cleanId.includes('panda')) {
      this.synthesizePandaChirp(pitchMul);
    } else if (cleanId.includes('owl') || cleanId.includes('burung') || cleanId.includes('hantu')) {
      this.synthesizeOwlHoot(pitchMul);
    } else if (cleanId.includes('hamster')) {
      this.synthesizeHamsterSqueak(pitchMul);
    } else if (cleanId.includes('naga') || cleanId.includes('dragon')) {
      this.synthesizeDragonChime(pitchMul);
    } else {
      this.synthesizeGenericHappyChirp(pitchMul);
    }
  }

  // 1. Kucing (Cat): Playful ascending meow-purr with gentle vibrato
  private synthesizeCatMeow(pitchMul: number) {
    if (!this.ctx) return;
    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520 * pitchMul, startTime);
    osc.frequency.exponentialRampToValueAtTime(820 * pitchMul, startTime + 0.16);
    osc.frequency.exponentialRampToValueAtTime(640 * pitchMul, startTime + 0.35);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.24, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  }

  // 2. Kelinci (Rabbit): Cheerful bouncy double-squeak pips
  private synthesizeRabbitChirp(pitchMul: number) {
    if (!this.ctx) return;
    [0, 0.1].forEach((offset, idx) => {
      const startTime = this.ctx!.currentTime + offset;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      const base = idx === 0 ? 980 : 1240;
      osc.frequency.setValueAtTime(base * pitchMul, startTime);
      osc.frequency.exponentialRampToValueAtTime((base + 380) * pitchMul, startTime + 0.06);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.09);
    });
  }

  // 3. Shiba (Dog): Cheerful puppy yip-bark duo
  private synthesizeDogYip(pitchMul: number) {
    if (!this.ctx) return;
    [0, 0.09].forEach((offset, idx) => {
      const startTime = this.ctx!.currentTime + offset;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      const startF = idx === 0 ? 460 : 580;
      const endF = idx === 0 ? 680 : 840;

      osc.frequency.setValueAtTime(startF * pitchMul, startTime);
      osc.frequency.linearRampToValueAtTime(endF * pitchMul, startTime + 0.05);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.075);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.085);
    });
  }

  // 4. Panda: Round, friendly warm chirp
  private synthesizePandaChirp(pitchMul: number) {
    if (!this.ctx) return;
    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 * pitchMul, startTime);
    osc.frequency.exponentialRampToValueAtTime(490 * pitchMul, startTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(370 * pitchMul, startTime + 0.28);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.32);
  }

  // 5. Burung Hantu (Owl): Wise, soft double-hoot
  private synthesizeOwlHoot(pitchMul: number) {
    if (!this.ctx) return;
    [
      { delay: 0, f1: 520, f2: 560, dur: 0.14 },
      { delay: 0.17, f1: 680, f2: 590, dur: 0.22 }
    ].forEach(({ delay, f1, f2, dur }) => {
      const startTime = this.ctx!.currentTime + delay;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f1 * pitchMul, startTime);
      osc.frequency.exponentialRampToValueAtTime(f2 * pitchMul, startTime + dur * 0.7);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + dur + 0.02);
    });
  }

  // 6. Hamster: Super cute rapid micro-chirp triplet
  private synthesizeHamsterSqueak(pitchMul: number) {
    if (!this.ctx) return;
    [1350, 1580, 1850].forEach((freq, idx) => {
      const startTime = this.ctx!.currentTime + idx * 0.045;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * pitchMul, startTime);
      osc.frequency.linearRampToValueAtTime((freq + 200) * pitchMul, startTime + 0.035);

      gain.gain.setValueAtTime(0.16, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.045);
    });
  }

  // 7. Naga (Dragon): Magical mythical sparkle chime
  private synthesizeDragonChime(pitchMul: number) {
    if (!this.ctx) return;
    const notes = [659.25, 880, 1174.66, 1567.98]; // E5, A5, D6, G6
    notes.forEach((freq, idx) => {
      const startTime = this.ctx!.currentTime + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * pitchMul, startTime);
      osc.frequency.exponentialRampToValueAtTime((freq * 1.15) * pitchMul, startTime + 0.12);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // 8. Generic / Other species happy chirp
  private synthesizeGenericHappyChirp(pitchMul: number) {
    if (!this.ctx) return;
    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480 * pitchMul, startTime);
    osc.frequency.exponentialRampToValueAtTime(840 * pitchMul, startTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(680 * pitchMul, startTime + 0.22);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.27);
  }
}

export const soundManager = new SoundManager();

