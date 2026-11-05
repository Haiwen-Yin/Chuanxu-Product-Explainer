/* Standalone, dependency-free interactive product explainer. No business APIs. */
(() => {
  'use strict';
  const { chapters, pages, overview } = window.CX;
  const pageId = document.body.dataset.page || 'index';
  const chapter = chapters.find(c => c.id === pageId) || chapters[0];
  const data = pages[pageId];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paths = {
    flow: '<path d="M3 6h7l4 12h7M3 18h7L14 6h7"/><circle cx="3" cy="6" r="1"/><circle cx="21" cy="18" r="1"/>',
    book: '<path d="M3 4h6a4 4 0 0 1 3 1 4 4 0 0 1 3-1h6v15h-6a4 4 0 0 0-3 1 4 4 0 0 0-3-1H3zM12 5v15M6 8h3M6 11h3M15 8h3M15 11h3"/>',
    nodes: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><rect x="3" y="15" width="6" height="6" rx="1.5"/><path d="M9 6h6a3 3 0 0 1 3 3v6M6 9v6M9 18h6"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
    pulse: '<path d="M2 12h4l3-8 5 16 3-8h5"/>',
    plug: '<path d="m14 3 3 3m-8 8 2 2m-3-5-4 4a3 3 0 0 0 4 4l4-4M20 4l-4 4a3 3 0 0 1-4-4l1-1m-3 7 4 4m1-6 2 2m-1-2 2-2"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    message: '<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3H3V6a2 2 0 0 1 2-2zM7 9h10M7 13h6"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
    spark: '<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7zM20 2v4M18 4h4"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    file: '<path d="M13 3H5v18h14V9zM13 3v6h6M8 13h8M8 17h5"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    branches: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10M18 7a9 9 0 0 1-9 9H6"/>',
    flag: '<path d="M5 21V3h13l-3 4 3 4H5"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"/>',
    send: '<path d="m21 3-7 18-4-7-7-4zM10 14 21 3"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5M5.5 7a7 7 0 0 1 12-2l2.5 3M4 16l2.5 3a7 7 0 0 0 12-2"/>',
    key: '<circle cx="8" cy="9" r="5"/><path d="m12 13 8 8M16 17l3-3M18 19l3-3"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    box: '<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M8 5l9 5"/>',
    arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    left: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    play: '<path d="m8 4 12 8-12 8z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    expand: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>',
    minimize: '<path d="M3 8h5V3M21 8h-5V3M16 21v-5h5M8 21v-5H3"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    motion: '<path d="m13 3-3 7H4l8 11 2-8h6z"/>',
    flask: '<path d="M9 3h6M10 3v7L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3M8 15h8"/>',
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.box}</svg>`;
  const url = id => `${id}.html`;
  let motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { if (localStorage.getItem('cx-explainer-motion') === 'off') motion = false; } catch {}
  document.documentElement.dataset.motion = motion ? 'on' : 'off';
  const tourStage = new URLSearchParams(location.search).get('tour') === 'stage' && parent !== window;
  let presentation = tourStage || (new URLSearchParams(location.search).get('present') === '1' && !!data);
  const toast = message => {
    const element = document.querySelector('.toast');
    element.textContent = message;
    element.classList.add('visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('visible'), 2600);
  };
  function header() {
    return `<a class="skip-link" href="#main">跳至主要内容</a><header class="site-header"><div class="container header-inner"><a class="brand" href="index.html" aria-label="川序产品演示首页"><img src="assets/chuanxu-logo-zh.svg" alt="川序" width="126" height="43"><span class="brand-rule"></span><span class="brand-caption">产品交互图解</span></a><nav class="header-nav" aria-label="主导航"><a href="index.html" ${!data ? 'aria-current="page"' : ''}>产品总览</a><a href="index.html#chapters">演示目录</a><a href="index.html#capabilities">功能图谱</a></nav><div class="header-actions"><span class="header-issue">v5.0.3</span><button class="icon-btn motion-toggle" title="${motion ? '关闭动效' : '开启动效'}" aria-label="${motion ? '关闭动效' : '开启动效'}" aria-pressed="${motion}">${icon('motion')}</button><button class="text-btn presentation-toggle ${presentation ? 'active' : ''}" aria-pressed="${presentation}">${icon(presentation ? 'minimize' : 'expand')}<span>${presentation ? '退出讲解' : '讲解模式'}</span></button><button class="icon-btn mobile-menu" aria-label="打开导航" aria-expanded="false">${icon('menu')}</button></div></div></header><div class="progress-bar" aria-hidden="true"></div>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="container footer-inner"><a class="footer-brand" href="index.html"><img src="assets/chuanxu-mark.svg" alt="" width="26" height="26"><span>川序 Chuanxu · 让智能体运行有序、可信</span></a><p class="footer-note">内容依据川序 v5.0.3。交互用于讲解流程，不连接业务系统。<span>PRODUCT EXPLAINER / INDEPENDENT EDITION · 2026</span></p></div></footer><div class="toast" role="status" aria-live="polite"></div>`;
  }
  function explanationPair() {
    return `<div class="explanation-pair"><section class="explanation-block business-block" aria-label="看功能"><h4 class="explanation-label">看功能<span>FUNCTION</span></h4><p class="step-copy business-copy"></p></section><section class="explanation-block technical-block" aria-label="看实现"><h4 class="explanation-label">看实现<span>IMPLEMENTATION</span></h4><p class="step-copy technical-copy"></p></section></div>`;
  }
  function graph(scene, dark = false) {
    return graphVariant(scene,dark,false)+graphVariant(scene,dark,true);
  }
  function graphVariant(scene, dark, compact) {
    let positions = [[26, 44], [270, 44], [514, 44], [514, 232], [270, 232], [26, 232]];
    const width = 190, height = 80;
    let connections = [[0,1],[1,2],[2,3],[3,4],[4,5]];
    if (scene.layout === 'architecture') {
      positions = [[26,32],[270,32],[514,32],[270,190],[104,344],[456,344]];
      connections = [[0,1],[1,2],[1,3],[3,4],[4,5]];
    }
    if(compact){
      positions=[[26,32],[244,32],[244,165],[26,165],[26,298],[244,298]];
      if(scene.layout==='architecture')connections=[[0,1],[1,2],[1,3],[3,4],[4,5]];
    }
    const edgePath = (a,b) => {
      const [x,y] = positions[a], [bx,by] = positions[b];
      if (y === by) return bx > x ? `M${x+width} ${y+40}H${bx-6}` : `M${x} ${y+40}H${bx+width+6}`;
      if (x === bx) return `M${x+width/2} ${y+height}V${by-7}`;
      return `M${x+width/2} ${y+height}C${x+width/2} ${y+height+30},${bx+width/2} ${by-30},${bx+width/2} ${by-7}`;
    };
    const edgeMarkup = connections.map(([a,b],i) => `<path class="flow-edge" data-edge-from="${scene.nodes[a].id}" data-edge-to="${scene.nodes[b].id}" d="${edgePath(a,b)}"/>`).join('');
    const nodes = scene.nodes.map((node,i) => {
      const [x,y] = positions[i];
      return `<g class="flow-node" data-node="${node.id}" role="button" tabindex="0" aria-label="查看：${esc(node.title)}" transform="translate(${x} ${y})"><rect class="node-rect" width="${width}" height="${height}" rx="10"/><rect class="node-icon-bg" x="13" y="15" width="28" height="28" rx="7"/><svg class="node-icon icon" x="19" y="21" width="16" height="16" viewBox="0 0 24 24">${paths[node.icon] || paths.box}</svg><text class="node-title" x="51" y="29">${esc(node.title)}</text><text class="node-sub" x="14" y="61">${esc(node.sub)}</text><circle class="node-state" cx="173" cy="17" r="3"/><text class="node-number" x="170" y="65">${String(i+1).padStart(2,'0')}</text></g>`;
    }).join('');
    const signals = scene.signals || ['当前身份', '来源版本', '执行回执'];
    const pillWidths = scene.signals ? 80 : 100;
    const start = (730 - (signals.length * pillWidths + (signals.length-1) * 10)) / 2;
    const middle = scene.layout === 'architecture' || compact ? '' : signals.map((s,i) => `<g transform="translate(${start+i*(pillWidths+10)} 163)"><rect class="signal-pill" width="${pillWidths}" height="25" rx="12.5"/><text class="signal-text" x="${pillWidths/2}" y="16.5" text-anchor="middle">${s}</text></g>`).join('');
    const band = scene.layout === 'architecture' && !compact ? '' : `<g transform="translate(26 ${compact?414:367})"><rect class="db-band" width="${compact?408:678}" height="51" rx="8"/><svg class="db-symbol icon" x="18" y="15" width="20" height="20" viewBox="0 0 24 24">${paths.database}</svg><text class="db-band-text" x="50" y="23">数据库保存权威状态</text><text class="db-band-sub" x="50" y="38">${compact?'IDENTITY · KNOWLEDGE · TASK · AUDIT':'IDENTITY · KNOWLEDGE · TASK · REVISION · AUDIT'}</text>${compact?'':'<text class="db-band-sub" x="655" y="29" text-anchor="end">DB FOR AGENT</text>'}</g>`;
    const marker=`arrow-${dark?'dark':'light'}-${compact?'compact':'wide'}`;
    return `<svg class="flow-svg ${compact?'compact-graph':'wide-graph'}" viewBox="0 0 ${compact?'460 490':'730 445'}" role="group" aria-label="${esc(scene.name || '一次工作的流转')}流程图"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10" fill="${dark?'#4f759b':'#9bb1ca'}"/></marker></defs><g style="--edge-marker:url(#${marker})">${edgeMarkup}</g>${middle}${band}${nodes}</svg>`;
  }
  function home() {
    const atlas = [
      ['knowledge','search','多信号知识检索','授权 · 适用性 · 精确引用'],['knowledge','file','引导入库与发布','来源 · 候选 · 独立审核'],['knowledge','clock','记忆与工作便笺','时态 · 修订 · 上下文'],['collaboration','list','Task 与执行步骤','attempt · 租约 · 回执'],
      ['collaboration','nodes','Graph、Loop 与 Harness','依赖 · 屏障 · 有界迭代'],['collaboration','send','连续工作与交接','Work · Handoff · DB4A2A'],['governance','shield','身份与资源授权','Human ∩ Agent · 安全域'],['governance','lock','运行隔离与治理','主机证据 · 审批 · 审计'],
      ['runtime','spark','模型路由与能力','Profile · 修订 · 实际探测'],['runtime','pulse','容量、用量与恢复','协调 · 观测 · 未知结果'],['integrations','plug','Skill、Tool 与协议','按需加载 · 版本化接入'],['architecture','database','原生数据库与交付','Oracle · PostgreSQL · YashanDB'],
    ];
    return `<main id="main"><section class="hero container"><div class="hero-topline"><div class="eyebrow">CHUANXU / PRODUCT EXPLORER</div><div class="version-pill">基于 v5.0.3</div></div><div class="hero-grid"><div class="hero-copy"><h1>让智能体的工作，<br><em>有据可循。</em></h1><p class="hero-description">从一份知识，到一次协作。<br>用可交互的流程，看见川序如何组织 Agent 的<br class="desktop-break">身份、上下文、行动与结果。</p><div class="actions"><a class="button" href="knowledge.html">开始探索 ${icon('arrow')}</a><button class="button secondary watch-flow">${icon('play')}演示一次工作</button></div><div class="hero-footnote"><span>${icon('database')}数据库原生</span><span>${icon('nodes')}人机协作</span><span>${icon('shield')}权限与治理</span></div></div><div class="hero-board"><div class="board-grid"></div><div class="hero-board-head"><span class="stage-eyebrow">ONE WORK. EVERY STEP.</span><span class="stage-status"><i class="status-dot"></i>流程示意</span></div><div class="hero-stage">${graph(overview,!tourStage)}</div><div class="hero-board-footer"><div class="hero-caption"><span class="mono">01 / 06</span><span class="hero-current">从一个明确目标开始。</span></div><div class="hero-controls"><div class="hero-dots">${overview.steps.map((_,i)=>`<span class="${i===0?'active':''}"></span>`).join('')}</div><button class="hero-play" aria-label="${motion?'暂停演示':'播放演示'}">${icon(motion?'pause':'play')}</button></div></div>${explanationPair()}</div></div><div class="principle-strip"><div class="principle">${icon('database')}<div><strong>让状态有根</strong><small>知识、任务和审计，保存在数据库。</small></div></div><div class="principle">${icon('shield')}<div><strong>让行动有界</strong><small>在当前身份、权限与预算内执行。</small></div></div><div class="principle">${icon('refresh')}<div><strong>让工作接续</strong><small>带着目标、依据和责任继续。</small></div></div></div></section><section class="section container" id="chapters"><div class="section-heading reveal"><div><div class="eyebrow">SIX CHAPTERS / ONE PLATFORM</div><h2>沿着工作流，理解川序。</h2></div><p class="section-description">选择一个主题，播放具体场景。<br>功能与实现同步呈现，随步骤一起更新。</p></div><div class="chapter-grid">${chapters.slice(1).map(c=>`<a class="chapter-card reveal" href="${url(c.id)}"><div class="card-top"><span class="card-icon">${icon(c.icon)}</span><span class="serial">CHAPTER / ${c.number}</span></div><h3>${c.name}</h3><p>${c.short}</p><div class="card-bottom"><span>${c.en}</span>${icon('arrow')}</div></a>`).join('')}</div><div class="work-story reveal"><div><div class="eyebrow">A STORY YOU CAN FOLLOW</div><h2>用一个真实业务问题，<br>串起一整段工作。</h2><p>“这次升级，需要哪些条件？”<br>从找依据、交接验证到结果留存，理解平台各部分为什么需要彼此连接。</p><div class="reading-links"><a href="knowledge.html?scene=retrieval">从知识开始 ${icon('arrow')}</a><a href="collaboration.html?scene=handoff">从协作开始 ${icon('arrow')}</a></div></div><div class="story-steps"><a class="story-step" href="knowledge.html?scene=retrieval"><span class="serial">01</span><span>先找对版本、对范围的依据</span>${icon('arrow')}</a><a class="story-step" href="collaboration.html?scene=handoff"><span class="serial">02</span><span>把未决问题交给下一位 Agent</span>${icon('arrow')}</a><a class="story-step" href="runtime.html?scene=unknown"><span class="serial">03</span><span>遇到未知结果，先核对再恢复</span>${icon('arrow')}</a></div></div></section><section class="section container" id="capabilities"><div class="section-heading reveal"><div><div class="eyebrow">CAPABILITY ATLAS</div><h2>功能相连，边界清晰。</h2></div><p class="section-description">从日常使用到运行实现，<br>每一项能力都有它所依赖的身份、数据与规则。</p></div><div class="atlas-grid reveal">${atlas.map(([id,i,title,sub])=>`<a class="atlas-item" href="${url(id)}">${icon(i)}<h3>${title}</h3><p>${sub}</p></a>`).join('')}</div><p class="atlas-footer">${icon('info')}企业专属治理按企业版范围交付，协议与底座能力按具体版本和契约使用。</p></section></main>`;
  }
  function sidebar() {
    return `<aside class="chapter-sidebar" aria-label="演示章节"><div class="sidebar-kicker">EXPLORE CHUANXU</div>${chapters.map(c=>`<a class="sidebar-link ${c.id===pageId?'active':''}" href="${url(c.id)}" ${c.id===pageId?'aria-current="page"':''}><span class="serial">${c.number}</span><span>${c.name}</span>${c.id===pageId?icon('arrow'):''}</a>`).join('')}<div class="sidebar-bottom"><p>先看工作怎样发生，<br>再看背后的实现。</p><span>INTERACTIVE / v5.0.3</span></div></aside>`;
  }
  function experiment() {
    const e = data.experiment;
    return `<section class="experiment reveal" aria-labelledby="experiment-heading"><div class="experiment-heading"><div><h3 id="experiment-heading">${e.title}</h3><p>${e.copy}</p></div>${icon('flask')}</div><div class="experiment-grid"><div class="experiment-inputs">${e.toggles ? e.toggles.map((title,i)=>`<label class="switch-label"><span>${title}</span><input type="checkbox" data-condition="${i}" ${i<2?'checked':''}><span class="switch-track" aria-hidden="true"></span></label>`).join('') : `<div class="experiment-options" role="group" aria-label="${e.type==='architecture'?'选择数据库':'选择请求状态'}">${e.options.map((o,i)=>`<button class="option-btn" data-option="${i}" aria-pressed="${i===0}">${o}</button>`).join('')}</div>`}</div><div class="experiment-result" aria-live="polite"><div class="result-status"></div><h4></h4><p></p></div></div></section>`;
  }
  function topic() {
    const index = chapters.findIndex(c=>c.id===pageId), next = chapters[(index+1)%chapters.length], previous = chapters[index-1];
    return `<main id="main" class="container topic-layout">${sidebar()}<div class="topic-body"><section class="topic-intro"><div class="eyebrow">${chapter.number} / ${chapter.en}</div><h1>${data.headline[0]}<br><span>${data.headline[1]}</span></h1><p>${data.intro}</p><div class="tag-row">${data.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div></section><section class="topic-demo" id="demo"><h2 class="demo-title">${data.question}</h2><div class="scenario-tabs" role="tablist" aria-label="演示场景">${data.scenes.map((s,i)=>`<button class="scenario-tab" id="tab-${s.id}" role="tab" aria-controls="scene-panel" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}" data-scene="${s.id}">${icon(s.nodes[0].icon)}${s.name}</button>`).join('')}</div><div class="demo-workbench" id="scene-panel" role="tabpanel" aria-labelledby="tab-${data.scenes[0].id}"></div><p class="scenario-caption">${icon('info')}点击节点或序号分步查看；播放时可暂停。所有内容均为本地流程示意。</p><div class="presentation-nav"><a href="${url(previous.id)}?present=1">${icon('left')}${previous.name}</a><a href="${url(next.id)}?present=1">${next.name}${icon('arrow')}</a></div></section>${experiment()}<section class="topic-cards"><div class="topic-section-head"><h2>这一章的能力</h2><span>FUNCTION → IMPLEMENTATION</span></div><div class="feature-grid">${data.cards.map(c=>`<article class="feature-card reveal">${icon(c.icon)}<h3>${c.title}</h3><p>${c.copy}</p><div class="implementation-detail"><h4>实现方式</h4><p>${c.implementation}</p></div></article>`).join('')}</div></section><nav class="next-chapter" aria-label="前后章节"><a class="next-link" href="${url(previous.id)}">${icon('left')}${previous.name}</a><a class="next-link" href="${url(next.id)}">${index===chapters.length-1?'返回总览':'下一章 · '+next.name}${icon('arrow')}</a></nav></div></main>`;
  }
  document.getElementById('app').innerHTML = header() + (data ? topic() : home()) + footer();
  if (!tourStage) document.querySelector('.presentation-toggle').insertAdjacentHTML('beforebegin', `<button class="text-btn tour-entry">${icon('refresh')}<span>全局演示</span></button>`);
  document.title = `${data?chapter.name+' · ':''}川序产品交互图解`;
  document.body.classList.toggle('presentation',presentation);
  let revealObserver;
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    revealObserver = new IntersectionObserver(entries => entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target);}}),{threshold:.05});
    document.querySelectorAll('.reveal').forEach(e=>revealObserver.observe(e));
  }
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight-innerHeight;
    document.querySelector('.progress-bar').style.width = `${max>0?scrollY/max*100:0}%`;
  };
  addEventListener('scroll',updateProgress,{passive:true});
  addEventListener('resize',updateProgress,{passive:true});
  const mobileMenu = document.querySelector('.mobile-menu');
  mobileMenu.addEventListener('click',()=>{
    const open = mobileMenu.getAttribute('aria-expanded')!=='true';
    mobileMenu.setAttribute('aria-expanded',String(open));
    mobileMenu.setAttribute('aria-label',open?'关闭导航':'打开导航');
    mobileMenu.innerHTML=icon(open?'close':'menu');
    document.querySelector('.header-nav').classList.toggle('open',open);
  });
  document.querySelectorAll('.header-nav a').forEach(a=>a.addEventListener('click',()=>{
    document.querySelector('.header-nav').classList.remove('open');
    mobileMenu.setAttribute('aria-expanded','false');
  }));
  const updateGraph = (container, scene, index) => {
    const active = new Set(scene.steps[index].active);
    const done = new Set(scene.steps.slice(0,index).flatMap(s=>s.active));
    container.querySelectorAll('[data-node]').forEach(n=>{
      n.classList.toggle('is-active',active.has(n.dataset.node));
      n.classList.toggle('is-done',done.has(n.dataset.node));
      n.setAttribute('aria-pressed',String(active.has(n.dataset.node)));
    });
    container.querySelectorAll('[data-edge-to]').forEach(e=>{
      e.classList.toggle('is-active',active.has(e.dataset.edgeTo));
      e.classList.toggle('is-travelled',done.has(e.dataset.edgeTo));
    });
  };
  let stopAnimation = () => {};
  let restartAnimation = () => {};
  let showTourStep = () => {};
  if (!data) {
    let heroStep=0, playing=motion&&!tourStage, timer;
    const board = document.querySelector('.hero-board');
    const update = () => {
      updateGraph(board,overview,heroStep);
      board.querySelector('.hero-caption .mono').textContent=`${String(heroStep+1).padStart(2,'0')} / 06`;
      board.querySelector('.hero-current').textContent=overview.steps[heroStep].title;
      board.querySelector('.business-copy').textContent=overview.steps[heroStep].business;
      board.querySelector('.technical-copy').textContent=overview.steps[heroStep].technical;
      board.querySelectorAll('.hero-dots span').forEach((n,i)=>n.classList.toggle('active',i===heroStep));
      board.querySelector('.hero-play').innerHTML=icon(playing?'pause':'play');
      board.querySelector('.hero-play').setAttribute('aria-label',playing?'暂停演示':'播放演示');
    };
    const schedule = () => {
      clearInterval(timer);
      if(playing&&motion&&!document.hidden)timer=setInterval(()=>{heroStep=(heroStep+1)%overview.steps.length;update();},3500);
    };
    board.querySelector('.hero-play').addEventListener('click',()=>{
      if(!motion){toast('动效已关闭，可点击流程节点查看。');return;}
      playing=!playing;update();schedule();
    });
    board.querySelectorAll('[data-node]').forEach(n=>{
      const action=()=>{heroStep=overview.steps.findIndex(s=>s.active.includes(n.dataset.node));playing=false;update();schedule();};
      n.addEventListener('click',action);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}});
    });
    document.querySelector('.watch-flow').addEventListener('click',()=>{
      if(!motion){toast('动效已关闭，可点击流程节点分步查看。');board.scrollIntoView({block:'center'});return;}
      heroStep=0;playing=true;update();schedule();board.scrollIntoView({behavior:'smooth',block:'center'});
      board.querySelector('.hero-play').focus({preventScroll:true});
    });
    stopAnimation=()=>{playing=false;clearInterval(timer);update();};
    restartAnimation=()=>{playing=true;update();schedule();};
    showTourStep=(_scene,step)=>{stopAnimation();heroStep=Math.max(0,Math.min(overview.steps.length-1,step));update();};
    addEventListener('visibilitychange',schedule);
    update();schedule();
  } else {
    const requestedScene = new URLSearchParams(location.search).get('scene');
    let current=data.scenes.find(s=>s.id===requestedScene)||data.scenes[0];
    let index=0, playing=false, speed=1, timer;
    const panel=document.getElementById('scene-panel');
    function schedule() {
      clearInterval(timer);
      if(playing&&motion&&!document.hidden)timer=setInterval(()=>{
        if(index<current.steps.length-1){index++;update();}else{playing=false;schedule();update();}
      },5500/speed);
    }
    function update() {
      const s=current.steps[index];
      updateGraph(panel,current,index);
      panel.querySelector('.step-counter').textContent=`STEP ${String(index+1).padStart(2,'0')} / ${String(current.steps.length).padStart(2,'0')}`;
      panel.querySelector('.step-title').textContent=s.title;
      panel.querySelector('.business-copy').textContent=s.business;
      panel.querySelector('.technical-copy').textContent=s.technical;
      panel.querySelector('.event-text').textContent=s.event;
      panel.querySelectorAll('.step-marker').forEach((b,i)=>{
        if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
        b.classList.toggle('done',i<index);
      });
      panel.querySelector('.play-btn').innerHTML=icon(playing?'pause':'play')+(playing?'暂停':'播放');
      panel.querySelector('.play-btn').setAttribute('aria-label',playing?'暂停自动播放':'自动播放此场景');
      panel.querySelector('.prev-step').disabled=index===0;
      panel.querySelector('.next-step').disabled=index===current.steps.length-1;
      panel.dataset.step=String(index);
    }
    function render() {
      panel.setAttribute('aria-labelledby',`tab-${current.id}`);
      document.querySelectorAll('[data-scene]').forEach(b=>{const selected=b.dataset.scene===current.id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
      panel.innerHTML=`<div class="workbench-top"><p class="scene-description">${current.description}</p><span class="stage-status"><i class="status-dot"></i>流程示意</span></div><div class="workbench-main"><div class="diagram-panel"><div class="diagram-index"><span>FLOW / ${current.id.toUpperCase()}</span><span>点击节点，查看这一步</span></div>${graph(current)}<p class="graph-caption">${current.layout==='architecture'?'各层表达职责，实际部署按环境配置。':'身份、来源与结果，共同关联到权威数据。'}</p></div><div class="explanation"><div id="step-explanation"><div class="step-counter"></div><h3 class="step-title"></h3>${explanationPair()}</div><div class="event-receipt"><div class="event-label">ILLUSTRATIVE EVENT</div><div class="event-text"></div></div></div></div><div class="playback"><div class="step-track" role="group" aria-label="流程步骤">${current.steps.map((s,i)=>`${i?'<span class="track-line" aria-hidden="true"></span>':''}<button class="step-marker" data-step="${i}" aria-label="第 ${i+1} 步：${esc(s.title)}">${String(i+1).padStart(2,'0')}</button>`).join('')}</div><div class="playback-actions"><button class="icon-btn prev-step" aria-label="上一步" title="上一步">${icon('left')}</button><button class="play-btn" aria-label="自动播放此场景"></button><button class="icon-btn next-step" aria-label="下一步" title="下一步">${icon('arrow')}</button><select class="speed-select" aria-label="播放速度"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></div></div>`;
      panel.querySelector('.speed-select').value=String(speed);
      const go = n => {index=Math.max(0,Math.min(current.steps.length-1,n));playing=false;schedule();update();};
      panel.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.step))));
      panel.querySelectorAll('[data-node]').forEach(n=>{
        const action=()=>go(current.steps.findIndex(s=>s.active.includes(n.dataset.node)));
        n.addEventListener('click',action);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}});
      });
      panel.querySelector('.prev-step').addEventListener('click',()=>go(index-1));
      panel.querySelector('.next-step').addEventListener('click',()=>go(index+1));
      panel.querySelector('.play-btn').addEventListener('click',()=>{
        if(!motion){toast('动效已关闭，请使用序号或箭头分步查看。');return;}
        playing=!playing;if(playing&&index===current.steps.length-1)index=0;update();schedule();
      });
      panel.querySelector('.speed-select').addEventListener('change',e=>{speed=Number(e.target.value);schedule();});
      update();
    }
    function selectScene(id) {
      current=data.scenes.find(s=>s.id===id)||data.scenes[0];index=0;playing=false;clearInterval(timer);render();
      try {const u=new URL(location.href);u.searchParams.set('scene',current.id);history.replaceState(null,'',u);} catch {}
    }
    const scenarioTabs=[...document.querySelectorAll('[data-scene]')];
    scenarioTabs.forEach((b,i)=>{
      b.addEventListener('click',()=>selectScene(b.dataset.scene));
      b.addEventListener('keydown',e=>{
        let next;
        if(e.key==='ArrowRight')next=(i+1)%scenarioTabs.length;
        if(e.key==='ArrowLeft')next=(i-1+scenarioTabs.length)%scenarioTabs.length;
        if(e.key==='Home')next=0;if(e.key==='End')next=scenarioTabs.length-1;
        if(next!==undefined){e.preventDefault();selectScene(scenarioTabs[next].dataset.scene);scenarioTabs[next].focus();}
      });
    });
    panel.addEventListener('keydown',e=>{
      if(e.target.tagName==='SELECT')return;
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        e.preventDefault();index=Math.max(0,Math.min(current.steps.length-1,index+(e.key==='ArrowRight'?1:-1)));playing=false;schedule();update();
      }
    });
    stopAnimation=()=>{playing=false;schedule();update();};
    showTourStep=(scene,step)=>{
      stopAnimation();
      const selected=data.scenes.find(s=>s.id===scene)||data.scenes[0];
      const changed=selected!==current;
      current=selected;index=Math.max(0,Math.min(current.steps.length-1,step));
      if(changed)render();else update();
    };
    addEventListener('visibilitychange',schedule);
    render();
    const e=data.experiment, result=document.querySelector('.experiment-result');
    let selectedOption=0;
    function updateExperiment() {
      const checks=[...document.querySelectorAll('[data-condition]')].map(c=>c.checked);
      let status='ALLOW',title='',copy='',blocked=false;
      if(e.type==='knowledge'){
        if(!checks[0]){status='DRAFT';title='可以保存草稿，先补齐来源。';copy='资料尚未成为正式知识，继续完善来源、责任与适用信息。';blocked=true;}
        else if(!checks[1]){status='PENDING REVIEW';title='保留候选，等待独立审核。';copy='候选仍不能作为共享知识发布，作者不能自审自批。';blocked=true;}
        else if(!checks[2]){status='PRIVATE';title='可晋升私有知识，尚未共享。';copy='目标受众表达使用意图；扩大共享范围仍需单独授权。';blocked=true;}
        else {status='SHARING AUTHORIZED';title='共享条件具备，仍按发布链路执行。';copy='发布保留精确来源与修订，后续读取继续检查当前权限。';}
      }else if(e.type==='governance'){
        const ok=checks.every(Boolean);blocked=!ok;status=ok?'ALLOW':'DENY';title=ok?'可以使用当前获准来源。':'本次来源使用被拒绝。';copy=ok?'发起人和 Agent 共同获准，仍需核对模型披露及当次执行条件。':!checks[0]?'Human 无权读取，Agent 的允许不能替代发起人的权限。':!checks[1]?'Agent 无权读取，不能借用 Human 或数据库 Owner 权限。':'来源已不在适用期内，较高检索得分不会覆盖这个条件。';
      }else if(e.type==='collaboration'){
        const ok=checks.every(Boolean);blocked=!ok;status=ok?'ACCEPT RESULT':'REJECT RESULT';title=ok?'具备写入结果的当前条件。':'这条结果暂不能写入。';copy=ok?'写入仍按具体任务契约核对，结果与业务验收分别记录。':!checks[0]?'Worker 已失去执行权；fencing 拒绝迟到写入。':!checks[1]?'目标版本已改变；先核对实际版本和已批准决定。':'原始来源已撤权，历史快照不能恢复当前访问权。';
      }else if(e.type==='integrations'){
        const ok=checks.every(Boolean);blocked=!ok;status=ok?'INVOCATION ELIGIBLE':'INVOCATION BLOCKED';title=ok?'具备进入受控执行的条件。':'保留能力目录，阻止本次执行。';copy=ok?'真正派发仍核对实例、租约、参数与来源范围。':!checks[0]?'当前契约尚未批准；重新发现不会自动继承旧版本授权。':!checks[1]?'能力可见不等于动作获准，需对本次请求明确授权。':'原始凭证已失效，不能替换令牌为旧请求补造权限。';
      }else if(e.type==='runtime'){
        const outcomes=[['UNOBSERVED','先核对远端，保持未知。','暂不盲目重发。客户端超时不证明 Provider 已停止，原请求未确认结束前保留占用。'],['RECONCILED','读取已完成结果，再决定下一步。','核对真实请求和结果；是否需要新动作，由具体业务状态和批准决定。'],['NOT SENT','可以评估一次有界的新派发。','重新核验当前授权、精确版本、预算与容量；确认未发送不自动授予重试权。']];
        [status,title,copy]=outcomes[selectedOption];blocked=selectedOption===0;
      }else if(e.type==='architecture'){
        const dbs=[['POSTGRESQL','受限 Owner 与强制 RLS','专用数据库、登录角色及身份映射；确认所需扩展与索引，拒绝超级用户、BYPASSRLS 或 Owner 回退绕过。'],['ORACLE','独立 PDB 与原生身份授权','准备应用 Owner、原生 End User、上下文、Data Role 与 Data Grant；按版本确认 Text、向量与 DBA 前置条件。'],['YASHANDB','独立用户与受限数据投影','准备独立 PDB、对象授权与会话身份；核对驱动、客户端与检索能力，不照搬 Oracle 的安全语义。']];
        [status,title,copy]=dbs[selectedOption];
      }
      result.querySelector('.result-status').textContent=status;result.querySelector('.result-status').classList.toggle('blocked',blocked);
      result.querySelector('h4').textContent=title;result.querySelector('p').textContent=copy;
    }
    document.querySelectorAll('[data-condition]').forEach(n=>n.addEventListener('change',updateExperiment));
    document.querySelectorAll('[data-option]').forEach(b=>b.addEventListener('click',()=>{
      selectedOption=Number(b.dataset.option);document.querySelectorAll('[data-option]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));updateExperiment();
    }));
    updateExperiment();
  }
  document.querySelector('.motion-toggle').addEventListener('click',()=>{
    motion=!motion;document.documentElement.dataset.motion=motion?'on':'off';
    try{localStorage.setItem('cx-explainer-motion',motion?'on':'off');}catch{}
    const b=document.querySelector('.motion-toggle');b.setAttribute('aria-pressed',String(motion));
    b.setAttribute('aria-label',motion?'关闭动效':'开启动效');b.title=motion?'关闭动效':'开启动效';
    if(!motion)stopAnimation();else if(!data)restartAnimation();
    toast(motion?'动效已开启。':'动效已关闭，仍可分步查看。');
  });
  document.querySelector('.presentation-toggle').addEventListener('click',()=>{
    if(!data){location.href='knowledge.html?present=1';return;}
    presentation=!presentation;document.body.classList.toggle('presentation',presentation);
    const button=document.querySelector('.presentation-toggle');button.classList.toggle('active',presentation);
    button.setAttribute('aria-pressed',String(presentation));button.innerHTML=icon(presentation?'minimize':'expand')+`<span>${presentation?'退出讲解':'讲解模式'}</span>`;
    try{const u=new URL(location.href);if(presentation)u.searchParams.set('present','1');else u.searchParams.delete('present');history.replaceState(null,'',u);}catch{}
    document.querySelector('.topic-demo').scrollIntoView({block:'start'});updateProgress();
    if(presentation)toast('讲解模式：聚焦动效，按 Esc 退出。');
  });
  addEventListener('keydown',e=>{if(e.key==='Escape'&&presentation&&!tourStage&&!document.body.classList.contains('tour-running'))document.querySelector('.presentation-toggle').click();});
  window.CXDemo = { show: showTourStep, stop: () => stopAnimation(), icon };
  updateProgress();
})();
