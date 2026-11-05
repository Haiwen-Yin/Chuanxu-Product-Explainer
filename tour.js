/* Global tour: one persistent fullscreen shell, one acknowledged step timer. */
(() => {
  'use strict';
  const channel = 'chuanxu-product-tour';
  const { chapters, pages, overview } = window.CX;
  const { icon } = window.CXDemo;
  const pageId = document.body.dataset.page || 'index';
  const stage = new URLSearchParams(location.search).get('tour') === 'stage' && parent !== window;
  if (stage) {
    document.body.classList.add('tour-stage');
    window.CXDemo.stop();
    document.querySelectorAll('[data-node]').forEach(n => n.tabIndex = -1);
    addEventListener('message', e => {
      const m = e.data;
      if (e.source !== parent || !m || m.channel !== channel || m.type !== 'show' || !Number.isInteger(m.step)) return;
      document.documentElement.dataset.motion = m.motion === 'on' ? 'on' : 'off';
      window.CXDemo.show(m.scene, m.step, m.mode);
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
    const scenes = c.id === 'index' ? [{ ...overview, id: 'overview', name: '一次工作的流转' }] : pages[c.id].scenes;
    return scenes.flatMap(s => s.steps.map((_, step) => ({ page: c.id, chapter: c.name, scene: s.id, name: s.name, step, count: s.steps.length })));
  });
  let seconds = 6, mode = 'business';
  try {
    const saved = JSON.parse(localStorage.getItem('cx-explainer-tour'));
    if (Number.isInteger(saved?.seconds) && saved.seconds >= 2 && saved.seconds <= 60) seconds = saved.seconds;
    if (saved?.mode === 'technical') mode = saved.mode;
  } catch {}
  const remember = () => { try { localStorage.setItem('cx-explainer-tour', JSON.stringify({ seconds, mode })); } catch {} };
  const duration = () => {
    const total = playlist.length * seconds;
    return `${Math.floor(total / 60)} 分${total % 60 ? ` ${total % 60} 秒` : ''}`;
  };
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="tour-settings" aria-labelledby="tour-settings-title">
      <form class="tour-settings-form">
        <div class="eyebrow">GLOBAL PRODUCT TOUR</div><h2 id="tour-settings-title">让川序，完整演示一遍。</h2>
        <p>从产品总览到六个主题，自动播放全部 96 步，播完循环。演示自动铺满窗口，并尝试进入浏览器全屏。</p>
        <div class="tour-fields"><label>每步停留（秒）<input name="seconds" type="number" min="2" max="60" step="1" required value="${seconds}"></label>
        <label>讲解内容<select name="mode"><option value="business">看功能</option><option value="technical">看实现</option></select></label></div>
        <p class="tour-duration"></p><p class="tour-settings-note">可随时暂停、调速或切换步骤。关闭动效时仍按时切换静态步骤；离开标签页会暂停计时。按 Esc 退出。</p>
        <div class="tour-settings-actions"><button type="button" class="text-btn tour-cancel">取消</button><button type="submit" class="button">${icon('play')}开始循环演示</button></div>
      </form>
    </dialog>
    <section class="tour-player" hidden role="dialog" aria-modal="true" aria-label="川序全局循环演示" tabindex="-1">
      <div class="tour-screen"><span class="tour-loading" role="status">正在准备演示…</span></div>
      <div class="tour-toolbar">
        <div class="tour-heading"><img src="assets/chuanxu-mark.svg" alt="川序" width="30" height="30"><div><strong class="tour-chapter"></strong><span class="tour-status" role="status" aria-live="polite"></span></div></div>
        <div class="tour-transport"><button class="icon-btn tour-prev" aria-label="全局上一步" title="上一步（←）">${icon('left')}</button><button class="text-btn tour-pause">${icon('pause')}<span>暂停</span></button><button class="icon-btn tour-next" aria-label="全局下一步" title="下一步（→）">${icon('arrow')}</button></div>
        <div class="tour-options"><label>每步 <input class="tour-pace" type="number" min="2" max="60" step="1" required value="${seconds}" aria-label="全局每步停留秒数"> 秒</label><select class="tour-mode" aria-label="全局讲解内容"><option value="business">看功能</option><option value="technical">看实现</option></select><button class="icon-btn tour-fullscreen" aria-label="进入全屏" title="进入全屏">${icon('expand')}</button><button class="text-btn tour-exit" title="退出演示（Esc）">${icon('close')}<span>退出</span></button></div>
        <progress class="tour-progress" max="${playlist.length}" value="1" aria-label="本轮演示进度"></progress>
      </div>
    </section>`);
  const settings = document.querySelector('.tour-settings');
  const form = settings.querySelector('form');
  const player = document.querySelector('.tour-player');
  const screen = player.querySelector('.tour-screen');
  const pace = player.querySelector('.tour-pace');
  const reading = player.querySelector('.tour-mode');
  const pause = player.querySelector('.tour-pause');
  let active = false, paused = false, waiting = true, position = 0, round = 1;
  let frame, loadedPage, timer, token = 0, ownedFullscreen = false, fullscreenUnavailable = false, returnFocus;
  function update() {
    const item = playlist[position];
    player.dataset.position = String(position);
    player.dataset.state = waiting ? 'loading' : paused ? 'paused' : document.hidden ? 'hidden' : 'playing';
    player.querySelector('.tour-chapter').textContent = `${item.chapter} · ${item.name}`;
    player.querySelector('.tour-status').textContent = `${position + 1} / ${playlist.length} · 第 ${round} 轮 · ${waiting ? '准备中' : paused ? '已暂停' : document.hidden ? '后台暂停' : `每步 ${seconds} 秒`} · 场景 ${item.step + 1}/${item.count}${fullscreenUnavailable ? ' · 窗口演示' : ''}`;
    player.querySelector('.tour-progress').value = position + 1;
    pause.innerHTML = icon(paused ? 'play' : 'pause') + `<span>${paused ? '继续' : '暂停'}</span>`;
    pause.setAttribute('aria-label', paused ? '继续全局演示' : '暂停全局演示');
    pause.setAttribute('aria-pressed', String(paused));
    pace.value = String(seconds); reading.value = mode;
    const full = document.fullscreenElement === player;
    const button = player.querySelector('.tour-fullscreen');
    button.innerHTML = icon(full ? 'minimize' : 'expand');
    button.setAttribute('aria-label', full ? '返回窗口演示' : '进入全屏');
    button.title = full ? '返回窗口演示' : '进入全屏';
  }
  function schedule() {
    clearTimeout(timer);
    if (active && !paused && !waiting && !document.hidden) timer = setTimeout(() => advance(1), seconds * 1000);
  }
  function send() {
    clearTimeout(timer); waiting = true; update();
    const item = playlist[position];
    if (loadedPage === item.page) {
      frame.contentWindow.postMessage({ channel, type: 'show', scene: item.scene, step: item.step, mode,
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
    active = false; clearTimeout(timer); ownedFullscreen = false;
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
    if (key === ' ') { paused = !paused; update(); schedule(); }
  }
  document.querySelector('.tour-entry').addEventListener('click', () => {
    window.CXDemo.stop();
    form.elements.seconds.value = String(seconds); form.elements.mode.value = mode;
    settings.querySelector('.tour-duration').textContent = `当前每轮约 ${duration()}，可在演示中调整。`;
    settings.showModal();
  });
  form.elements.seconds.addEventListener('input', () => {
    const value = Number(form.elements.seconds.value);
    settings.querySelector('.tour-duration').textContent = Number.isInteger(value) && value >= 2 && value <= 60
      ? `当前每轮约 ${Math.floor(playlist.length * value / 60)} 分 ${playlist.length * value % 60} 秒。` : '请输入 2–60 之间的整数秒数。';
  });
  settings.querySelector('.tour-cancel').addEventListener('click', () => settings.close());
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    seconds = Number(form.elements.seconds.value); mode = form.elements.mode.value; remember();
    returnFocus = document.querySelector('.tour-entry'); settings.close();
    active = true; paused = false; position = 0; round = 1; waiting = true; loadedPage = null; fullscreenUnavailable = false;
    player.hidden = false; document.body.classList.add('tour-running');
    document.getElementById('app').inert = true;
    document.getElementById('app').setAttribute('aria-hidden', 'true');
    frame = document.createElement('iframe'); frame.className = 'tour-frame'; frame.title = '川序演示流程与讲解';
    screen.append(frame); send(); pause.focus(); requestFullscreen();
  });
  pause.addEventListener('click', () => { paused = !paused; update(); schedule(); });
  player.querySelector('.tour-prev').addEventListener('click', () => advance(-1));
  player.querySelector('.tour-next').addEventListener('click', () => advance(1));
  player.querySelector('.tour-exit').addEventListener('click', exit);
  pace.addEventListener('change', () => {
    if (!pace.checkValidity()) { pace.reportValidity(); pace.value = String(seconds); return; }
    seconds = Number(pace.value); remember(); update(); schedule();
  });
  reading.addEventListener('change', () => { mode = reading.value; remember(); send(); });
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
  addEventListener('pagehide', () => clearTimeout(timer));
  addEventListener('pageshow', () => { if (active) schedule(); });
  addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Tab') {
      const controls = [...player.querySelectorAll('button,input,select')].filter(n => !n.disabled);
      if (e.shiftKey && document.activeElement === controls[0]) { e.preventDefault(); controls.at(-1).focus(); }
      if (!e.shiftKey && document.activeElement === controls.at(-1)) { e.preventDefault(); controls[0].focus(); }
      return;
    }
    if (e.key !== 'Escape' && e.target.closest('input,select,button')) return;
    if (['Escape', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) { e.preventDefault(); keyAction(e.key); }
  });
})();
