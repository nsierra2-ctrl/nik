let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

function tone(opts: {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
}) {
  const c = getCtx();
  if (!c || muted) return;
  const start = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, start);
  if (opts.slideTo) {
    osc.frequency.exponentialRampToValueAtTime(
      opts.slideTo,
      start + opts.duration,
    );
  }
  const peak = opts.gain ?? 0.08;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);
  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + opts.duration + 0.05);
}

export const sounds = {
  setMuted(v: boolean) {
    muted = v;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vps_mute", v ? "1" : "0");
      } catch {
        /* ignore */
      }
    }
  },
  isMuted() {
    return muted;
  },
  init() {
    if (typeof window === "undefined") return;
    try {
      muted = localStorage.getItem("vps_mute") === "1";
    } catch {
      /* ignore */
    }
  },
  click() {
    tone({ freq: 880, duration: 0.06, type: "square", gain: 0.04 });
  },
  pop() {
    tone({ freq: 520, duration: 0.08, type: "sine", gain: 0.06, slideTo: 1040 });
  },
  add() {
    tone({ freq: 660, duration: 0.09, type: "triangle", gain: 0.07 });
    tone({ freq: 990, duration: 0.12, type: "triangle", gain: 0.06, delay: 0.06 });
  },
  remove() {
    tone({ freq: 440, duration: 0.08, type: "sawtooth", gain: 0.05, slideTo: 220 });
  },
  open() {
    tone({ freq: 320, duration: 0.18, type: "sine", gain: 0.05, slideTo: 640 });
  },
  success() {
    tone({ freq: 523, duration: 0.16, type: "triangle", gain: 0.08 });
    tone({ freq: 659, duration: 0.16, type: "triangle", gain: 0.08, delay: 0.12 });
    tone({ freq: 784, duration: 0.18, type: "triangle", gain: 0.08, delay: 0.24 });
    tone({ freq: 1047, duration: 0.34, type: "triangle", gain: 0.08, delay: 0.36 });
  },
};

if (typeof window !== "undefined") {
  sounds.init();
}
