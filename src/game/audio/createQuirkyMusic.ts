type QuirkyMusicController = {
  ensureStarted: () => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
  dispose: () => Promise<void>;
};

const BPM = 124;
const LOOKAHEAD_SECONDS = 0.18;
const SCHEDULER_INTERVAL_MS = 50;
const STEP_DURATION_SECONDS = 60 / BPM / 4;

const melodyPattern = [
  659.25,
  null,
  783.99,
  659.25,
  523.25,
  null,
  587.33,
  659.25,
  698.46,
  null,
  783.99,
  880,
  698.46,
  659.25,
  587.33,
  null,
];

const bassPattern = [
  130.81,
  130.81,
  null,
  146.83,
  164.81,
  164.81,
  null,
  146.83,
  174.61,
  174.61,
  null,
  196,
  164.81,
  146.83,
  130.81,
  null,
];

function createNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 0.2, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function rampGain(gain: GainNode, time: number, target: number) {
  gain.gain.cancelScheduledValues(time);
  gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), time);
  gain.gain.exponentialRampToValueAtTime(Math.max(target, 0.0001), time + 0.04);
}

export function createQuirkyMusic(initialMuted: boolean): QuirkyMusicController {
  let context: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let lowpassFilter: BiquadFilterNode | null = null;
  let noiseBuffer: AudioBuffer | null = null;
  let schedulerId: number | null = null;
  let nextStepTime = 0;
  let currentStep = 0;
  let muted = initialMuted;

  const setupContext = () => {
    if (context && masterGain && lowpassFilter && noiseBuffer) {
      return;
    }

    const AudioContextCtor = window.AudioContext;

    context = new AudioContextCtor();
    masterGain = context.createGain();
    lowpassFilter = context.createBiquadFilter();
    noiseBuffer = createNoiseBuffer(context);

    masterGain.gain.value = muted ? 0.0001 : 0.12;
    lowpassFilter.type = "lowpass";
    lowpassFilter.frequency.value = 2400;
    lowpassFilter.Q.value = 0.8;

    masterGain.connect(lowpassFilter);
    lowpassFilter.connect(context.destination);
  };

  const playTone = (
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ) => {
    if (!context || !masterGain) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  };

  const playKick = (startTime: number) => {
    if (!context || !masterGain) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(180, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(48, startTime + 0.12);

    gain.gain.setValueAtTime(0.9, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.16);
  };

  const playHat = (startTime: number, open = false) => {
    if (!context || !masterGain || !noiseBuffer) {
      return;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    const highpass = context.createBiquadFilter();

    source.buffer = noiseBuffer;
    highpass.type = "highpass";
    highpass.frequency.value = open ? 5600 : 7600;

    gain.gain.setValueAtTime(open ? 0.08 : 0.05, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (open ? 0.16 : 0.05));

    source.connect(highpass);
    highpass.connect(gain);
    gain.connect(masterGain);
    source.start(startTime);
    source.stop(startTime + (open ? 0.2 : 0.08));
  };

  const scheduleStep = (step: number, time: number) => {
    const melodyNote = melodyPattern[step % melodyPattern.length];
    const bassNote = bassPattern[step % bassPattern.length];

    if (step % 4 === 0) {
      playKick(time);
    }

    if (step % 2 === 0) {
      playHat(time + 0.01, step % 8 === 6);
    }

    if (bassNote) {
      playTone(bassNote, time, STEP_DURATION_SECONDS * 0.85, "square", 0.05);
    }

    if (melodyNote) {
      playTone(melodyNote, time + 0.01, STEP_DURATION_SECONDS * 0.5, "triangle", 0.04);
      playTone(melodyNote * 2, time + 0.01, STEP_DURATION_SECONDS * 0.22, "square", 0.015);
    }
  };

  const scheduler = () => {
    if (!context || muted) {
      return;
    }

    while (nextStepTime < context.currentTime + LOOKAHEAD_SECONDS) {
      scheduleStep(currentStep, nextStepTime);
      nextStepTime += STEP_DURATION_SECONDS;
      currentStep = (currentStep + 1) % melodyPattern.length;
    }
  };

  const startScheduler = () => {
    if (!context || muted || schedulerId !== null) {
      return;
    }

    nextStepTime = context.currentTime + 0.06;
    schedulerId = window.setInterval(scheduler, SCHEDULER_INTERVAL_MS);
    scheduler();
  };

  const stopScheduler = () => {
    if (schedulerId !== null) {
      window.clearInterval(schedulerId);
      schedulerId = null;
    }
  };

  return {
    ensureStarted: async () => {
      setupContext();

      if (!context || !masterGain) {
        return;
      }

      if (context.state === "suspended") {
        await context.resume();
      }

      if (!muted) {
        rampGain(masterGain, context.currentTime, 0.12);
        startScheduler();
      }
    },
    setMuted: async (nextMuted: boolean) => {
      muted = nextMuted;
      setupContext();

      if (!context || !masterGain) {
        return;
      }

      if (nextMuted) {
        stopScheduler();
        rampGain(masterGain, context.currentTime, 0.0001);
        return;
      }

      if (context.state === "suspended") {
        await context.resume();
      }

      rampGain(masterGain, context.currentTime, 0.12);
      startScheduler();
    },
    dispose: async () => {
      stopScheduler();

      if (!context) {
        return;
      }

      await context.close();
      context = null;
      masterGain = null;
      lowpassFilter = null;
      noiseBuffer = null;
    },
  };
}