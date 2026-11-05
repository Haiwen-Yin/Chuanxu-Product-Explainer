/* Global tour: acknowledged visuals, prerecorded narration, then a short gap. */
(() => {
  'use strict';
  const channel = 'chuanxu-product-tour';
  const { chapters, pages, overview, introduction } = window.CX;
  const { icon } = window.CXDemo;
  const pageId = document.body.dataset.page || 'index';
  const stage = new URLSearchParams(location.search).get('tour') === 'stage' && parent !== window;
  if (stage) {
    document.body.classList.add('tour-stage');
    if (pageId === 'index') {
      document.querySelector('.hero-board-head').innerHTML = '<div class="tour-opening-brand"><img src="assets/chuanxu-logo-zh.svg" alt="川序 Chuanxu" width="126" height="43"><span>产品交互图解 · v5.0.3</span></div><span class="stage-status"><i class="status-dot"></i>一次工作的流转</span>';
      document.getElementById('app').insertAdjacentHTML('beforeend', `<section class="tour-introduction" hidden aria-labelledby="tour-intro-title"><div class="tour-intro-card"><div class="tour-intro-header"><div class="tour-opening-brand"><img src="assets/chuanxu-logo-zh.svg" alt="川序 Chuanxu" width="126" height="43"><span>产品交互图解 · v5.0.3</span></div><span class="stage-status">认识川序</span></div><div class="tour-intro-content"><div class="eyebrow">MEET CHUANXU / 认识川序</div><h1 class="tour-intro-title" id="tour-intro-title">让智能体运行<br><em>有序、可信。</em></h1><div class="tour-intro-statements"><section><h2>川序是什么</h2><p class="business-copy"></p></section><section><h2>让团队看清工作</h2><p class="technical-copy"></p></section></div><div class="tour-intro-topics"><span>身份与责任</span><span>知识与依据</span><span>任务与协作</span><span>执行与证据</span></div><p class="tour-intro-next">接下来，从一次工作的流转开始。${icon('arrow')}</p></div></div></section>`);
      document.querySelector('.tour-introduction .business-copy').textContent = introduction.steps[0].business;
      document.querySelector('.tour-introduction .technical-copy').textContent = introduction.steps[0].technical;
    } else {
      document.querySelector('.workbench-top').insertAdjacentHTML('afterbegin', '<div class="tour-chapter-brand"><img src="assets/chuanxu-logo-zh.svg" alt="川序 Chuanxu" width="126" height="43"></div>');
    }
    window.CXDemo.stop();
    document.querySelectorAll('[data-node]').forEach(n => n.tabIndex = -1);
    addEventListener('message', e => {
      const m = e.data;
      if (e.source !== parent || !m || m.channel !== channel || m.type !== 'show' || !Number.isInteger(m.step)) return;
      document.documentElement.dataset.motion = m.motion === 'on' ? 'on' : 'off';
      const intro = pageId === 'index' && m.scene === introduction.id;
      document.body.classList.toggle('tour-intro-stage', intro);
      if (pageId === 'index') document.querySelector('.tour-introduction').hidden = !intro;
      if (!intro) window.CXDemo.show(m.scene, m.step);
      document.querySelectorAll('[data-node]').forEach(n => n.tabIndex = -1);
      parent.postMessage({ channel, type: 'shown', page: pageId, token: m.token }, '*');
    });
    addEventListener('keydown', e => {
      if (['Escape', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        parent.postMessage({ channel, type: 'key', key: e.key }, '*');
      }
    });
    parent.postMessage({ channel, type: 'ready', page: pageId }, '*');
    return;
  }

  const playlist = chapters.flatMap(c => {
    const scenes = c.id === 'index' ? [introduction, { ...overview, id: 'overview', name: '一次工作的流转' }] : pages[c.id].scenes;
    return scenes.flatMap(s => s.steps.map((_, step) => ({ page: c.id, chapter: c.name, scene: s.id, name: s.name, step, count: s.steps.length })));
  });
  let voiceRate = 1;
  try {
    const saved = JSON.parse(localStorage.getItem('cx-explainer-tour'));
    if ([1, 2, 3].includes(saved?.voiceRate)) voiceRate = saved.voiceRate;
  } catch {}
  const remember = () => { try { localStorage.setItem('cx-explainer-tour', JSON.stringify({ voiceRate })); } catch {} };
  const duration = () => {
    if (!window.CXNarration) return '待音频就绪';
    const total = Math.ceil(window.CXNarration.audio_seconds / voiceRate + playlist.length * window.CXNarration.gap_seconds);
    return `${Math.floor(total / 60)} 分${total % 60 ? ` ${total % 60} 秒` : ''}`;
  };
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="tour-settings" aria-labelledby="tour-settings-title">
      <form class="tour-settings-form">
        <div class="eyebrow">GLOBAL PRODUCT TOUR</div><h2 id="tour-settings-title">让川序，完整演示一遍。</h2>
        <p>先认识川序，再从产品总览进入六个主题。共 97 个讲解片段，播完循环；演示自动铺满窗口，并尝试进入全屏。</p>
        <div class="tour-voice-settings"><span>讲解速度</span><button type="button" class="text-btn tour-rate-button" data-voice-rate>语速 1×</button><span class="tour-rate-hint">点击切换 1× / 2× / 3×</span></div>
        <div class="tour-sound-settings"><label><input type="checkbox" data-sound-enabled>播放轻柔背景音</label><label>音量 <input type="range" min="0" max="100" value="22" data-sound-volume aria-label="演示背景音量"></label></div>
        <p class="tour-duration"></p><p class="tour-settings-note">使用预制语音播报，讲解结束后间隔 0.3 秒进入下一步。功能与实现同步展示；暂停或离开标签页时，语音与画面一起停留。按 Esc 退出。</p>
        <div class="tour-settings-actions"><button type="button" class="text-btn tour-cancel">取消</button><button type="submit" class="button">${icon('play')}开始循环演示</button></div>
      </form>
    </dialog>
    <section class="tour-player" hidden role="dialog" aria-modal="true" aria-label="川序全局循环演示" tabindex="-1">
      <div class="tour-screen"><span class="tour-loading" role="status">正在准备演示…</span></div>
      <div class="tour-toolbar">
        <div class="tour-heading"><img src="assets/chuanxu-mark.svg" alt="川序" width="30" height="30"><div><strong class="tour-chapter"></strong><span class="tour-status" role="status" aria-live="polite"></span></div></div>
        <div class="tour-transport"><button class="icon-btn tour-prev" aria-label="全局上一步" title="上一步（←）">${icon('left')}</button><button class="text-btn tour-pause">${icon('pause')}<span>暂停</span></button><button class="icon-btn tour-next" aria-label="全局下一步" title="下一步（→）">${icon('arrow')}</button></div>
        <div class="tour-options"><button class="text-btn tour-rate-button" data-voice-rate>语速 1×</button><div class="tour-sound-controls"><button class="icon-btn" data-sound-toggle aria-label="关闭背景音"></button><input type="range" min="0" max="100" value="22" data-sound-volume aria-label="背景音量"></div><button class="icon-btn tour-fullscreen" aria-label="进入全屏" title="进入全屏">${icon('expand')}</button><button class="text-btn tour-exit" title="退出演示（Esc）">${icon('close')}<span>退出</span></button></div>
        <progress class="tour-progress" max="${playlist.length}" value="1" aria-label="本轮演示进度"></progress>
      </div>
    </section>`);
  const settings = document.querySelector('.tour-settings');
  const form = settings.querySelector('form');
  const player = document.querySelector('.tour-player');
  const screen = player.querySelector('.tour-screen');
  const pause = player.querySelector('.tour-pause');
  const voice = document.createElement('audio');
  voice.className = 'tour-narration-audio'; voice.preload = 'auto'; voice.volume = 0.9;
  voice.defaultPlaybackRate = voiceRate; voice.playbackRate = voiceRate; voice.preservesPitch = true;
  player.append(voice);
  let active = false, paused = false, waiting = true, position = 0, round = 1;
  let frame, loadedPage, timer, token = 0, ownedFullscreen = false, fullscreenUnavailable = false, returnFocus;
  let voicePhase = 'off', voiceFailed = false, voiceEpoch = 0, voiceEvents, gapRemaining = 0, gapDeadline = 0;
  function clearClock() {
    clearTimeout(timer);
    if (gapDeadline) gapRemaining = Math.max(0, gapDeadline - performance.now());
    gapDeadline = 0;
  }
  function stopVoice() {
    voiceEpoch++; voiceEvents?.abort(); voice.pause(); voice.removeAttribute('src'); voice.load();
    window.CXSound?.setNarrating(false);
  }
  function prepareVoice() {
    clearClock(); stopVoice(); voiceFailed = false; gapRemaining = 0;
    voicePhase = 'loading';
    const item = playlist[position], key = `${item.page}/${item.scene}/${item.step}`;
    const entry = window.CXNarration?.entries[key];
    voice.dataset.key = key;
    if (!entry) { failVoice(); return; }
    const epoch = voiceEpoch;
    voiceEvents = new AbortController();
    const listen = (name, action) => voice.addEventListener(name, () => { if (active && epoch === voiceEpoch) action(); }, { signal: voiceEvents.signal });
    listen('playing', () => {
      if (paused || waiting || document.hidden) { voice.pause(); window.CXSound?.setNarrating(false); return; }
      voicePhase = 'speaking'; window.CXSound?.setNarrating(true); update();
    });
    listen('waiting', () => { if (!voiceFailed) voicePhase = 'loading'; window.CXSound?.setNarrating(false); update(); });
    listen('ended', () => {
      voicePhase = 'gap'; gapRemaining = (window.CXNarration?.gap_seconds || 0.3) * 1000;
      window.CXSound?.setNarrating(false); update(); schedule();
    });
    listen('error', failVoice);
    voice.defaultPlaybackRate = voiceRate; voice.playbackRate = voiceRate;
    voice.src = new URL(entry.src, location.href).href; voice.load();
  }
  function failVoice() {
    clearClock(); voice.pause(); voiceFailed = true; voicePhase = 'error'; paused = true;
    window.CXSound?.setNarrating(false); update();
  }
  function togglePause() {
    if (voiceFailed) { paused = false; prepareVoice(); }
    else paused = !paused;
    update(); schedule();
  }
  function playVoice() {
    const epoch = voiceEpoch;
    if (!voice.paused) return;
    voice.play().catch(error => {
      if (!active || epoch !== voiceEpoch || error.name === 'AbortError') return;
      if (error.name === 'NotAllowedError') { paused = true; voicePhase = 'blocked'; update(); }
      else failVoice();
    });
  }
  function update() {
    const item = playlist[position];
    player.dataset.position = String(position);
    player.dataset.state = waiting ? 'loading' : paused ? 'paused' : document.hidden ? 'hidden' : 'playing';
    player.dataset.narration = voicePhase;
    player.dataset.playback = 'voice';
    player.dataset.voiceRate = String(voiceRate);
    player.querySelector('.tour-chapter').textContent = `${item.chapter} · ${item.name}`;
    const narrationStatus = voiceFailed ? '语音加载失败，请重试或手动切步' : voicePhase === 'gap' ? '讲解间隔' : voicePhase === 'blocked' ? '点击继续，开始语音' : voicePhase === 'loading' ? '准备语音' : `语音讲解 ${voiceRate}×`;
    player.querySelector('.tour-status').textContent = `${position + 1} / ${playlist.length} · 第 ${round} 轮 · ${waiting ? '准备中' : voiceFailed || voicePhase === 'blocked' ? narrationStatus : paused ? '已暂停' : document.hidden ? '后台暂停' : narrationStatus} · 场景 ${item.step + 1}/${item.count}${fullscreenUnavailable ? ' · 窗口演示' : ''}`;
    player.querySelector('.tour-progress').value = position + 1;
    pause.innerHTML = icon(paused ? 'play' : 'pause') + `<span>${voiceFailed ? '重试语音' : paused ? '继续' : '暂停'}</span>`;
    pause.setAttribute('aria-label', voiceFailed ? '重试当前语音' : paused ? '继续全局演示' : '暂停全局演示');
    pause.setAttribute('aria-pressed', String(paused));
    updateRateButtons();
    const full = document.fullscreenElement === player;
    const button = player.querySelector('.tour-fullscreen');
    button.innerHTML = icon(full ? 'minimize' : 'expand');
    button.setAttribute('aria-label', full ? '返回窗口演示' : '进入全屏');
    button.title = full ? '返回窗口演示' : '进入全屏';
  }
  function updateRateButtons() {
    document.querySelectorAll('button[data-voice-rate]').forEach(button => {
      const label = `语速 ${voiceRate}×`;
      if (button.textContent !== label) button.textContent = label;
      button.setAttribute('aria-label', `当前语速 ${voiceRate} 倍，点击切换为 ${voiceRate % 3 + 1} 倍`);
      button.title = `点击切换至 ${voiceRate % 3 + 1}×`;
    });
  }
  function schedule() {
    clearClock();
    if (!active || paused || waiting || document.hidden) { voice.pause(); window.CXSound?.setNarrating(false); return; }
    if (!voiceFailed) {
      if (voicePhase === 'gap') {
        gapDeadline = performance.now() + gapRemaining;
        timer = setTimeout(() => { gapDeadline = 0; advance(1); }, gapRemaining);
      } else playVoice();
    }
  }
  function send() {
    clearClock(); waiting = true; update();
    const item = playlist[position];
    if (loadedPage === item.page) {
      frame.contentWindow.postMessage({ channel, type: 'show', scene: item.scene, step: item.step,
        motion: document.documentElement.dataset.motion, token: ++token }, '*');
    } else {
      loadedPage = null;
      screen.classList.add('loading');
      const target = new URL(`${item.page}.html`, location.href);
      target.search = '?tour=stage'; target.hash = '';
      frame.src = target.href;
    }
  }
  function advance(delta) {
    if (!active) return;
    if (position === playlist.length - 1 && delta === 1) round++;
    if (position === 0 && delta === -1) round = Math.max(1, round - 1);
    position = (position + delta + playlist.length) % playlist.length;
    prepareVoice();
    send();
  }
  function requestFullscreen() {
    if (!player.requestFullscreen) { showWindowNotice(); return; }
    try {
      player.requestFullscreen().then(() => {
        if (!active) { if (document.fullscreenElement === player) document.exitFullscreen().catch(() => {}); return; }
        ownedFullscreen = document.fullscreenElement === player; fullscreenUnavailable = false; update();
      }).catch(showWindowNotice);
    } catch { showWindowNotice(); }
  }
  function showWindowNotice() {
    if (!active) return;
    fullscreenUnavailable = true; update();
  }
  function exit() {
    if (!active) return;
    active = false; clearClock(); stopVoice(); voicePhase = 'off'; ownedFullscreen = false;
    if (document.fullscreenElement === player) document.exitFullscreen().catch(() => {});
    player.hidden = true; frame.remove(); frame = null; loadedPage = null;
    document.body.classList.remove('tour-running');
    document.getElementById('app').inert = false;
    document.getElementById('app').removeAttribute('aria-hidden');
    returnFocus?.focus({ preventScroll: true });
  }
  function keyAction(key) {
    if (key === 'Escape') exit();
    if (key === 'ArrowLeft') advance(-1);
    if (key === 'ArrowRight') advance(1);
    if (key === ' ') togglePause();
  }
  document.querySelector('.tour-entry').addEventListener('click', () => {
    window.CXDemo.stop();
    updateRateButtons();
    settings.querySelector('.tour-duration').textContent = `当前每轮约 ${duration()}，可在演示中调整。`;
    settings.showModal();
  });
  settings.querySelector('.tour-cancel').addEventListener('click', () => settings.close());
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    remember();
    returnFocus = document.querySelector('.tour-entry'); settings.close();
    active = true; paused = false; position = 0; round = 1; waiting = true; loadedPage = null; fullscreenUnavailable = false;
    player.hidden = false; document.body.classList.add('tour-running');
    document.getElementById('app').inert = true;
    document.getElementById('app').setAttribute('aria-hidden', 'true');
    frame = document.createElement('iframe'); frame.className = 'tour-frame'; frame.title = '川序演示流程与讲解';
    screen.append(frame); prepareVoice(); send(); pause.focus(); requestFullscreen();
  });
  pause.addEventListener('click', togglePause);
  player.querySelector('.tour-prev').addEventListener('click', () => advance(-1));
  player.querySelector('.tour-next').addEventListener('click', () => advance(1));
  player.querySelector('.tour-exit').addEventListener('click', exit);
  document.querySelectorAll('button[data-voice-rate]').forEach(button => button.addEventListener('click', () => {
    voiceRate = voiceRate % 3 + 1;
    voice.defaultPlaybackRate = voiceRate; voice.playbackRate = voiceRate;
    remember(); updateRateButtons();
    settings.querySelector('.tour-duration').textContent = `当前每轮约 ${duration()}，可在演示中调整。`;
    if (active) update();
  }));
  player.querySelector('.tour-fullscreen').addEventListener('click', () => {
    if (document.fullscreenElement === player) {
      ownedFullscreen = false; document.exitFullscreen().catch(() => {});
    } else requestFullscreen();
  });
  addEventListener('fullscreenchange', () => {
    if (!active) return;
    if (ownedFullscreen && !document.fullscreenElement) { exit(); return; }
    update();
  });
  addEventListener('message', e => {
    const m = e.data;
    // Source checks also work for offline file:// frames with opaque origins.
    if (!active || e.source !== frame?.contentWindow || !m || m.channel !== channel) return;
    if (m.type === 'key') { keyAction(m.key); return; }
    if (m.page !== playlist[position].page) return;
    if (m.type === 'ready') { loadedPage = m.page; send(); }
    if (m.type === 'shown' && m.token === token) { waiting = false; screen.classList.remove('loading'); update(); schedule(); }
  });
  document.addEventListener('visibilitychange', () => { if (active) { update(); schedule(); } });
  addEventListener('pagehide', () => { clearClock(); voice.pause(); window.CXSound?.setNarrating(false); });
  addEventListener('pageshow', () => { if (active) schedule(); });
  addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Tab') {
      const controls = [...player.querySelectorAll('button,input,select')].filter(n => !n.disabled && n.getClientRects().length);
      if (e.shiftKey && document.activeElement === controls[0]) { e.preventDefault(); controls.at(-1).focus(); }
      if (!e.shiftKey && document.activeElement === controls.at(-1)) { e.preventDefault(); controls[0].focus(); }
      return;
    }
    if (e.key !== 'Escape' && e.target.closest('input,select,button')) return;
    if (['Escape', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) { e.preventDefault(); keyAction(e.key); }
  });
})();
