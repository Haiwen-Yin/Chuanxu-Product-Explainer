/* Sparse, softly decaying local tones, without a sustained bass bed. */
(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('tour') === 'stage' && parent !== window) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let enabled = true, volume = 22, context, source, gain, failed = false, narrating = false;
  try {
    const saved = JSON.parse(localStorage.getItem('cx-explainer-sound'));
    if (saved?.enabled === false) enabled = false;
    if (Number.isInteger(saved?.volume) && saved.volume >= 0 && saved.volume <= 100) volume = saved.volume;
  } catch {}
  const speaker = on => `<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/>${on ? '<path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>' : '<path d="m17 9 5 6m0-6-5 6"/>'}</svg>`;
  const remember = () => { try { localStorage.setItem('cx-explainer-sound', JSON.stringify({ enabled, volume })); } catch {} };
  function sync() {
    const state = !AudioContext || failed ? 'unavailable' : !enabled ? 'off' : document.hidden ? 'hidden' : context?.state === 'running' ? 'playing' : 'waiting';
    document.documentElement.dataset.sound = state;
    document.querySelectorAll('[data-sound-toggle]').forEach(button => {
      const iconState = String(enabled && volume > 0);
      if (button.dataset.soundIcon !== iconState) {
        button.innerHTML = speaker(enabled && volume > 0);
        button.dataset.soundIcon = iconState;
      }
      button.setAttribute('aria-pressed', String(enabled));
      const label = state === 'unavailable' ? '浏览器不支持背景音' : enabled ? '关闭背景音' : '开启背景音';
      button.setAttribute('aria-label', label);
      button.title = state === 'waiting' ? '背景音已开启，首次点击页面后播放；点击此按钮关闭' : label;
      button.disabled = state === 'unavailable';
    });
    document.querySelectorAll('[data-sound-volume]').forEach(input => { input.value = String(volume); });
    document.querySelectorAll('[data-sound-enabled]').forEach(input => { input.checked = enabled; input.disabled = !AudioContext || failed; });
    document.querySelectorAll('.sound-status').forEach(n => {
      n.textContent = state === 'waiting' ? '背景音已开启，点击页面开始播放。' : state === 'playing' ? '正在播放轻柔背景音。' : state === 'off' ? '背景音已关闭。' : state === 'unavailable' ? '当前浏览器无法播放背景音。' : '背景音已暂停。';
    });
  }
  function level() {
    if (!gain) return;
    gain.gain.setTargetAtTime(enabled ? volume / 100 * 0.18 * (narrating ? 0.12 : 1) : 0, context.currentTime, 0.35);
  }
  function ensure() {
    if (!enabled || !AudioContext || failed || document.hidden) { sync(); return; }
    try {
      if (!context) {
        context = new AudioContext();
        const rate = 22050, duration = 32;
        const buffer = context.createBuffer(1, rate * duration, rate);
        const samples = buffer.getChannelData(0);
        // Leave space between notes; a slow attack and release avoid clicks or drone.
        const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 880, 783.99, 587.33];
        const noteLength = 3.1;
        for (let note = 0; note < notes.length; note++) {
          const start = Math.round((0.6 + note * 4) * rate);
          for (let i = 0; i < Math.floor(noteLength * rate); i++) {
            const t = i / rate, phase = 2 * Math.PI * notes[note] * t;
            const release = Math.min(1, (noteLength - t) / 0.5);
            const envelope = (1 - Math.exp(-t / 0.12)) * Math.exp(-t / 0.85) * release * release;
            samples[start + i] = 0.5 * envelope * (Math.sin(phase) + 0.045 * Math.exp(-t / 0.4) * Math.sin(phase * 2));
          }
        }
        const highpass = context.createBiquadFilter();
        highpass.type = 'highpass'; highpass.frequency.value = 240; highpass.Q.value = 0.5;
        const lowpass = context.createBiquadFilter();
        lowpass.type = 'lowpass'; lowpass.frequency.value = 1800; lowpass.Q.value = 0.5;
        gain = context.createGain(); gain.gain.value = 0;
        source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
        source.connect(highpass); highpass.connect(lowpass); lowpass.connect(gain);
        gain.connect(context.destination); source.start();
        context.addEventListener('statechange', sync);
      }
      level();
      if (context.state === 'suspended') context.resume().then(sync).catch(sync);
    } catch { failed = true; }
    sync();
  }
  function setEnabled(value) {
    enabled = value; remember(); level();
    if (enabled) ensure(); else sync();
  }
  function setVolume(value) {
    if (!Number.isFinite(value)) return;
    volume = Math.round(Math.max(0, Math.min(100, value))); remember(); level(); sync();
  }
  function bind() {
    document.querySelector('.motion-toggle').insertAdjacentHTML('afterend', `<button class="icon-btn sound-toggle" data-sound-toggle aria-label="关闭背景音"></button>`);
    document.querySelector('.tour-sound-settings')?.insertAdjacentHTML('afterend', '<p class="sound-status" role="status" aria-live="polite"></p>');
    document.querySelectorAll('[data-sound-toggle]').forEach(n => n.addEventListener('click', () => setEnabled(!enabled)));
    document.querySelectorAll('[data-sound-enabled]').forEach(n => n.addEventListener('change', () => setEnabled(n.checked)));
    document.querySelectorAll('[data-sound-volume]').forEach(n => n.addEventListener('input', () => setVolume(Number(n.value))));
    sync(); ensure();
  }
  addEventListener('pointerdown', ensure, { capture: true, passive: true });
  addEventListener('keydown', ensure, { capture: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { context?.suspend().then(sync).catch(sync); sync(); }
    else ensure();
  });
  addEventListener('pagehide', () => { context?.suspend().catch(() => {}); });
  addEventListener('pageshow', ensure);
  // The parent owns the single audio context, so chapter navigation keeps the sound continuous.
  window.CXSound = { get enabled() { return enabled; }, get volume() { return volume; },
    get state() { return context?.state || 'uninitialized'; }, setEnabled, setVolume,
    setNarrating(value) { narrating = !!value; level(); } };
  bind();
})();
