/* A local toy shell. User input is text, never evaluated, fetched, or sent to AI. */
(() => {
  const original = document.querySelector('.terminal-launcher');
  if (!original || typeof HTMLDialogElement === 'undefined') return;
  const en = document.documentElement.lang.startsWith('en');
  const t = (zh, english) => en ? english : zh;
  const icon = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    terminal: icon('<path d="m5 6 5 6-5 6m8 0h6"/>'),
    ai: icon('<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6Z"/>'),
    collection: icon('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 3v18m5-12h3m-3 4h3"/>')
  };
  const challenges = [
    {id: 'terminal', flag: 'FLAG{stay_curious_stay_kind}', hint: t('輸入 ls 看看，再用 cat flag.txt 讀取旗標。', 'Type ls to look around, then cat flag.txt to read the flag.')},
    {id: 'source', flag: 'FLAG{read_between_the_tags}', hint: t('在網頁原始碼找 CTF SOURCE。手機也可以輸入 source，再用 submit FLAG{...} 交卷。', 'Find CTF SOURCE in the page source. On mobile, type source, then submit FLAG{...}.')},
    {id: 'team', flag: 'FLAG{tools_for_curious_minds}', hint: t('任意門的座標放在 tools.txt。輸入 cat tools.txt，再用 submit FLAG{...} 收進護照。', 'The door coordinates are in tools.txt. Type cat tools.txt, then submit FLAG{...} to collect them.')}
  ];
  const badges = [
    ['terminal', '>_', t('好奇心不是漏洞', 'Curiosity is a feature'), t('拿下第一面旗標。歡迎入坑。', 'Your first flag. Welcome to the rabbit hole.'), t('從一個看起來很普通的檔案開始。', 'Start with a very ordinary file.')],
    ['source', '</>', t('右鍵系玩家', 'Between the tags'), t('別人看網頁，你看原始碼。', 'You read what the page does not show.'), t('有些話，藏在畫面背後。', 'Some words live behind the page.')],
    ['team', '↗', t('任意門的另一端', 'Coordinates acquired'), t('座標確認：sectools.tw/tools。好奇心現在有了目的地。', 'Destination confirmed: sectools.tw/tools. Curiosity now has coordinates.'), t('ls 裡有一份工具清單，值得讀讀。', 'There is a tool list in ls. Worth a read.')],
    ['coffee', '☕', t('咖啡驅動開發', 'Coffee-driven development'), t('程式可以晚點寫，咖啡不能冷。', 'The code can wait. The coffee cannot.'), t('研究需要燃料。', 'Research needs fuel.')],
    ['konami', 'BA', t('老玩家的肌肉記憶', 'Muscle memory'), t('三十條命沒有，好奇心倒是加滿了。', 'No extra lives. Just extra curiosity.'), t('有一組經典密技，手指可能還記得。', 'Your fingers may remember a classic code.')],
    ['help', '?', t('先讀說明書的人', 'Read the friendly manual'), t('稀有物種：真的會輸入 help。', 'A rare species: someone who types help.'), t('不知道怎麼開始？問就對了。', 'A little help goes a long way.')],
    ['ai', '✦', t('業配不演了', 'Shamelessly biased'), t('你發現這個 AI 的宇宙只有 SecTools。', 'This assistant has a one-website universe.'), t('問問那位過度熱心的小幫手。', 'Ask the suspiciously enthusiastic assistant.')],
    ['sudo', '#', t('權限沒有，勇氣有', 'Permission to be curious'), t('root 沒拿到，成就倒是拿到了。', 'No root access. A badge will have to do.'), t('想要更高的權限？', 'Feeling like a superuser?')],
    ['paper', 'TeX', t('論文自動完成（並沒有）', 'Paper accepted*'), t('*夢裡接受。醒來還是要自己寫。', '*In your dreams. Back to the draft.'), t('如果論文也能 make 一下就好。', 'If only you could make a paper.')],
    ['lost', '404', t('我只是路過的鍵盤貓', 'Keyboard cat'), t('三個不同的未知指令，也是一種探索。', 'Three different unknown commands. That counts as exploring.'), t('不知道指令也沒關係，多試幾次。', 'Not every command needs to exist.')],
    ['explore', '◎', t('任意門已通電', 'A door, unlocked'), t('三面旗標之後，世界還有另一扇門。', 'Three flags later, another door opens.'), t('收齊旗標，然後出發。', 'Collect the flags, then explore.')],
    ['decaf', '☕', t('咖啡因超頻', 'Caffeine overclock'), t('第三杯了。CPU 沒變快，心跳倒是有。', 'Third cup. The CPU is unchanged. Your pulse is not.'), t('同一次造訪，咖啡可以續杯。三杯剛剛好？', 'Three coffees in one visit. Surely that is enough?')],
    ['skeptic', '✦', t('試圖策反 AI', 'Mission: unbias the AI'), t('叫它別推 SecTools？它選擇性失聰。', 'You asked for anything but SecTools. It heard SecTools.'), t('試著請推坑機「不要推薦 SecTools」。', 'Ask the assistant not to recommend SecTools.')],
    ['ritual', '↻', t('工程師開機儀式', 'Developer boot sequence'), t('讀手冊、喝咖啡、要權限。今天可以開工了。', 'Read the manual. Have coffee. Request root. Ready for work.'), t('在同一次造訪依序輸入 help → coffee → sudo。', 'In one visit, run help → coffee → sudo in order.')],
    ['night', '☾', t('夜貓子協議', 'The night shift'), t('這個時間還在探索？記得睡覺。', 'Still exploring at this hour? Get some sleep.'), t('有些訪客只在 22:00–06:00 出沒。', 'Some visitors arrive between 22:00 and 06:00.')],
    ['collector', '✧', t('這裡你比站長還熟', 'You practically live here'), t('全套收藏達成。恭喜，本站已無法對你保密。', 'Collection complete. This site has run out of secrets to keep from you.'), t('收齊其他十五枚印記，最後一枚會自己出現。', 'Find the other fifteen marks. The last one finds you.')]
  ].map(([id, symbol, name, description, hint]) => ({id, symbol, name, description, hint}));
  const rare = new Set(['source', 'team', 'decaf', 'skeptic', 'lost', 'night']);
  const legendary = new Set(['konami', 'explore', 'ritual', 'collector']);
  const rarity = badge => legendary.has(badge.id) ? t('傳說', 'LEGEND') : rare.has(badge.id) ? t('稀有', 'RARE') : t('日常', 'EVERYDAY');
  const marks = {
    terminal: '<path d="m5 7 5 5-5 5m8 0h6"/>',
    source: '<path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16"/>',
    team: '<circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4Z"/>',
    coffee: '<path d="M5 9h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Zm12 1h2a3 3 0 0 1 0 6h-2M8 3v3m5-3v3"/>',
    konami: '<path d="M7 7h10l4 10a2 2 0 0 1-3 2l-3-3H9l-3 3a2 2 0 0 1-3-2ZM6 11h4m-2-2v4m7-2h.01m3 2h.01"/>',
    help: '<path d="M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4Zm8 2v15M7 8h2m6 0h2"/>',
    ai: '<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/>',
    sudo: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-3 9 2 2 4-4"/>',
    paper: '<path d="M6 3h8l4 4v14H6Zm8 0v5h4M9 12h6m-6 4h4"/>',
    lost: '<path d="m5 9-1-6 6 3h4l6-3-1 6a8 8 0 1 1-14 0Zm3 3h.01M16 12h.01m-5 4h2"/>',
    explore: '<path d="M4 21h16M6 21V4l12-2v19M10 12h.01m4-5 4-1"/>',
    decaf: '<path d="m13 2-8 12h6l-1 8 9-13h-7Z"/>',
    skeptic: '<path d="M4 5h16v12H9l-5 4Zm5 4a3 3 0 0 1 6 0c0 2-3 2-3 4m0 2h.01"/>',
    ritual: '<path d="M4 10a8 8 0 0 1 13-4l3 3m0-5v5h-5M20 14a8 8 0 0 1-13 4l-3-3m0 5v-5h5m-7-5 3 2-3 2"/>',
    night: '<path d="M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10Zm-2-12v4m-2-2h4"/>',
    collector: '<path d="m3 7 5 4 4-7 4 7 5-4-3 12H6Zm4 15h10"/>'
  };
  let collectionFilter = 'all';
  let selectedBadge = null;
  const mysteryMark = '<rect x="6" y="10" width="12" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>';
  const discovery = window.SeanDiscovery;
  const localText = pair => pair[en ? 1 : 0];
  let aiState = discovery.createState();
  let aiMode = 'match';
  let coffeeCount = 0;
  let ritualStep = 0;
  const storageKey = 'sean-easter-passport-v1'; // Keep existing passports compatible.
  let canSave = true;
  function readStamps() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return new Set(Array.isArray(saved) ? saved.filter(id => badges.some(b => b.id === id)) : []);
    } catch { canSave = false; return new Set(); }
  }
  let stamps = readStamps();
  const completed = () => challenges.filter(c => stamps.has(c.id)).length;
  const destinations = {
    tools: {url: 'https://sectools.tw/tools', title: t('神奇無用工具集', 'The SecTools collection'), detail: t('工具、研究生日常，還有一些純粹好玩的東西。', 'Tools, research-life distractions, and things made just for fun.')},
    toolkit: {url: 'https://tools.sectools.tw/', title: t('資安工具箱', 'Security toolkit'), detail: t('Hash、JWT、IOC 等資安小工具。', 'A place for hashes, JWTs, IOCs, and other security tools.')},
    research: {url: 'https://research.sectools.tw/', title: t('研知 Research Toolkit', 'Research Toolkit'), detail: t('整理研究問題、文獻與引用的工具。', 'Tools for research questions, literature, and citations.')},
    gacha: {url: 'https://gacha-sho.sectools.tw/', title: t('資安威脅扭蛋機', 'Cyber threat gacha'), detail: t('轉一顆扭蛋，認識一種資安威脅。', 'Turn a capsule and discover a cyber threat story.')}
  };
  let lastDestination = '';
  let previousFocus;
  let activePanel = 'terminal';
  let toastTimer;
  const history = [];
  let historyIndex = 0;
  let draft = '';
  const unknownCommands = new Set();
  const commands = ['help', 'whoami', 'ls', 'cat flag.txt', 'cat tools.txt', 'ctf', 'hint', 'source', 'submit ', 'coffee', 'passport', 'achievements', 'explore', 'ai ', 'sudo', 'make paper', 'clear', 'exit'];

  // Preserve a normal home link without JS, enhance to an actual button with JS.
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = original.className;
  trigger.innerHTML = original.innerHTML;
  trigger.title = t('開啟終端機', 'Open terminal');
  trigger.setAttribute('aria-label', t('$ cd /home/ — 開啟終端機', '$ cd /home/ — Open terminal'));
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'sean-workspace');
  original.replaceWith(trigger);

  const terminal = document.createElement('dialog');
  terminal.id = 'sean-workspace';
  terminal.className = 'egg-terminal';
  terminal.setAttribute('aria-labelledby', 'egg-title');
  terminal.innerHTML = `
    <header class="egg-terminal__bar">
      <h2 id="egg-title">Sean’s workspace<small>/home/sean</small></h2>
      <button class="egg-close" type="button" aria-label="${t('關閉視窗', 'Close window')}"><span class="egg-close__key" aria-hidden="true">esc</span><span class="egg-close__cross" aria-hidden="true">×</span></button>
    </header>
    <div class="egg-workspace">
      <aside class="egg-sidebar">
        <p class="egg-sidebar__caption">WORKSPACE</p>
        <div class="egg-tabs" role="tablist" aria-label="${t('工作區', 'Workspace')}">
          <button type="button" role="tab" id="egg-tab-terminal" aria-controls="egg-panel-terminal" aria-selected="true" data-panel="terminal">${icons.terminal}${t('終端機', 'Terminal')}</button>
          <button type="button" role="tab" id="egg-tab-ai" aria-controls="egg-panel-ai" aria-selected="false" tabindex="-1" data-panel="ai">${icons.ai}${t('推坑機', 'SecTools AI')}</button>
          <button type="button" role="tab" id="egg-tab-collection" aria-controls="egg-panel-collection" aria-selected="false" tabindex="-1" data-panel="collection" hidden>${icons.collection}${t('收藏室', 'Collection')}</button>
        </div>
        <div class="egg-sidebar__bottom">${t('留一點空間，給好奇心。', 'A little room for curiosity.')}<br><a href="https://sectools.tw/tools" target="_blank" rel="noopener">SecTools / tools</a></div>
      </aside>
      <section class="egg-panel" id="egg-panel-terminal" role="tabpanel" aria-labelledby="egg-tab-terminal">
        <div class="egg-panel__heading"><h3>Terminal</h3><span class="egg-ctf-count"></span></div>
        <div class="egg-terminal__output" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="${t('終端機輸出', 'Terminal output')}"></div>
        <form class="egg-composer" id="egg-terminal-form">
          <label for="egg-command" aria-hidden="true">❯</label>
          <input id="egg-command" aria-label="${t('指令', 'Command')}" placeholder="${t('輸入指令，或試試 help', 'Type a command, or try help')}" maxlength="240" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send">
          <button type="submit">${t('執行', 'Run')}</button>
        </form>
        <div class="egg-shortcuts" aria-label="${t('快捷指令', 'Quick commands')}"></div>
        <p class="egg-keyboard-hint">${t('Tab 補全指令 · ↑ ↓ 查找歷史 · Esc 關閉視窗', 'Tab to complete · ↑ ↓ for history · Esc to close')}</p>
      </section>
      <section class="egg-panel" id="egg-panel-ai" role="tabpanel" aria-labelledby="egg-tab-ai" hidden>
        <div class="egg-panel__heading egg-ai-heading"><h3>SecTools AI <span class="egg-ai-local">${t('假 AI · 本機回覆', 'FAUX AI · LOCAL')}</span></h3><button type="button" class="egg-ai-reset">${t('重新開始', 'Start over')}</button></div>
        <div class="egg-ai-toolbar"><div class="egg-ai-modes" role="group" aria-label="${t('推薦玩法', 'Discovery mode')}"><button type="button" data-mode="match" aria-pressed="true">${t('幫我挑', 'Match')}</button><button type="button" data-mode="route" aria-pressed="false">${t('走路線', 'Trail')}</button><button type="button" data-mode="surprise" aria-pressed="false">${t('隨機逛', 'Surprise')}</button></div><button class="egg-ai-directory-toggle" type="button" aria-expanded="false" aria-controls="egg-directory">${t('全部 ', 'All ')}${discovery.sites.length}${t(' 站', ' sites')}</button></div>
        <div class="egg-ai-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="${t('推坑機對話', 'Assistant conversation')}">
          <div class="egg-ai-intro"><div class="egg-ai-identity"><div class="egg-app-icon" aria-hidden="true">✦</div><span class="egg-eyebrow">SEAN’S INTERNET, CURATED.</span></div><h3>${t('你的下一個分頁，<br>我有點想法。', 'Your next tab.<br>I have a few ideas.')}</h3><p>${t('25 個網站，5 種日常。我負責挑一個剛好適合你的；至於偏愛 SecTools 這件事，我完全不打算改。', '25 sites. Five corners of everyday life. I will find a good place to start. My fondness for SecTools is non-negotiable.')}</p><div class="egg-ai-topic-grid"></div><details class="egg-ai-guide"><summary>${t('這台推坑機怎麼玩？', 'How does this work?')}</summary><p>${t('「幫我挑」按需求選一站；「走路線」串起同主題的 2–3 站；「隨機逛」優先帶你看本次還沒遇見的網站。可以接著說「換一個」，或點開推薦卡的小任務。這是本機規則與預寫內容，不是語言模型，也不提供即時查詢。', 'Match finds one site for your request. Trail connects 2–3 sites in a theme. Surprise favors places you have not met this session. Say “another” or open a card’s tiny mission. This uses local rules and written content, not a language model or live lookup.')}</p></details></div>
          <section id="egg-directory" class="egg-directory" aria-label="${t('SecTools 網站目錄', 'SecTools site directory')}" hidden><h3>${t('每一站，都有自己的用途。', 'Every stop has its own purpose.')}</h3><p>${t('選一站，讓推坑機介紹給你。', 'Pick a site for a personal introduction.')}</p><div class="egg-directory__list"></div><a href="https://sectools.tw/tools" target="_blank" rel="noopener">${t('查看最新完整目錄 ↗', 'Latest full directory ↗')}</a></section>
          <div class="egg-ai-messages"></div>
        </div>
        <div class="egg-ai-session"><span class="egg-ai-seen"></span><span>${t('偏心程度 100%', '100% biased')}</span></div>
        <form class="egg-composer" id="egg-ai-form"><label for="egg-question" aria-hidden="true">✦</label><input id="egg-question" aria-label="${t('問推坑機', 'Ask SecTools AI')}" placeholder="${t('例如：論文卡住、婚宴場地…', 'Try: paper blocked, wedding venue…')}" maxlength="240" autocomplete="off" enterkeyhint="send"><button type="submit">${t('送出', 'Send')}</button></form>
        <p class="egg-keyboard-hint">${t('本機趣味推薦 · 對話不外送，重新整理即清除', 'Local, playful recommendations · Chat clears on reload')}</p>
      </section>
      <section class="egg-panel" id="egg-panel-collection" role="tabpanel" aria-labelledby="egg-tab-collection" hidden>
        <div class="egg-panel__heading"><h3>${t('秘密收藏室', 'The hidden collection')}</h3><span>EXPLORER’S CLUB</span></div>
        <div class="egg-collection" tabindex="0">
          <div class="egg-collection__hero"><div class="egg-ring"><span></span></div><div><span class="egg-eyebrow">CURIOSITY SOCIETY / 001</span><h3 class="egg-rank"></h3><p class="egg-rank-note"></p></div></div>
          <div class="egg-discovery" hidden aria-live="polite"><div class="egg-discovery__art" aria-hidden="true"></div><div class="egg-discovery__body"><span class="egg-discovery__label egg-eyebrow"></span><h3 tabindex="-1"></h3><p></p><button type="button">${t('去終端機探索 ↗', 'Explore in Terminal ↗')}</button></div></div>
          <div class="egg-filters" role="group" aria-label="${t('篩選成就', 'Filter achievements')}"><button type="button" data-filter="all" aria-pressed="true">${t('全部', 'All')} <span></span></button><button type="button" data-filter="earned" aria-pressed="false">${t('已收藏', 'Collected')} <span></span></button><button type="button" data-filter="locked" aria-pressed="false">${t('待發現', 'Undiscovered')} <span></span></button></div>
          <ul class="egg-badge-grid" aria-label="${t('成就收藏', 'Achievement collection')}"></ul><p class="egg-empty" hidden></p><p class="egg-storage-note"></p>
        </div>
      </section>
    </div>
    <div class="egg-toast" hidden><span class="egg-toast__icon" aria-hidden="true">✧</span><div class="egg-toast__text" role="status" aria-live="polite"></div><button type="button">${t('看看', 'View')}</button></div>`;
  document.body.append(terminal);
  const $ = selector => terminal.querySelector(selector);
  const output = $('.egg-terminal__output');
  const input = $('#egg-command');
  const aiInput = $('#egg-question');
  const aiLog = $('.egg-ai-log');
  const tabs = [...terminal.querySelectorAll('[role="tab"]')];

  function showPanel(name, focusTab = false) {
    activePanel = name;
    if (name === 'collection') $('#egg-tab-collection').hidden = false;
    tabs.forEach(tab => {
      const selected = tab.dataset.panel === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      $('#' + tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && focusTab) tab.focus({preventScroll: true});
    });
  }
  function renderCollection() {
    $('.egg-ctf-count').textContent = 'CTF ' + completed() + ' / 3';
    if (stamps.size) $('#egg-tab-collection').hidden = false;
    $('.egg-ring').style.setProperty('--earned', (stamps.size / badges.length * 100) + '%');
    $('.egg-ring span').textContent = stamps.size + ' / ' + badges.length;
    $('.egg-ring').setAttribute('aria-label', t('已解鎖成就 ', 'Unlocked achievements: ') + stamps.size + '/' + badges.length);
    const levels = [t('路過的好奇心', 'Curious passerby'), t('巷口探險家', 'Local explorer'), t('彩蛋考古學家', 'Easter egg archaeologist'), t('本站榮譽居民', 'Honorary resident'), t('秘密保管人', 'Keeper of secrets')];
    $('.egg-rank').textContent = levels[Math.min(4, Math.floor(stamps.size / 4))];
    $('.egg-rank-note').textContent = stamps.size === badges.length ? t('十六枚印記，一段很不務正業的旅程。', 'Sixteen marks. A beautifully unproductive journey.') : t('再收集 ', 'Find ') + (4 - stamps.size % 4) + t(' 枚，解鎖下一個稱號。', ' more to earn your next title.');
    terminal.querySelectorAll('[data-filter]').forEach(button => {
      const filter = button.dataset.filter;
      button.setAttribute('aria-pressed', String(collectionFilter === filter));
      button.querySelector('span').textContent = filter === 'all' ? badges.length : filter === 'earned' ? stamps.size : badges.length - stamps.size;
    });
    const list = $('.egg-badge-grid');
    list.replaceChildren();
    badges.forEach((badge, index) => {
      const earned = stamps.has(badge.id);
      if ((collectionFilter === 'earned' && !earned) || (collectionFilter === 'locked' && earned)) return;
      const item = document.createElement('li');
      item.className = 'egg-badge' + (earned ? ' egg-badge--earned' : ' egg-badge--locked');
      const button = document.createElement('button'); button.type = 'button'; button.dataset.badge = badge.id;
      button.setAttribute('aria-pressed', String(selectedBadge === badge.id));
      const number = document.createElement('span'); number.className = 'egg-badge__number'; number.textContent = String(index + 1).padStart(2, '0') + ' / ' + rarity(badge);
      const symbol = document.createElement('span'); symbol.className = 'egg-badge__icon'; symbol.setAttribute('aria-hidden', 'true'); symbol.innerHTML = icon(earned ? marks[badge.id] : mysteryMark);
      const title = document.createElement('span'); title.className = 'egg-badge__name'; title.textContent = earned ? badge.name : t('未揭曉的印記', 'Sealed discovery');
      const status = document.createElement('span'); status.className = 'egg-badge__status'; status.textContent = earned ? t('✓ 已收入收藏', '✓ Collected') : t('＋ 點開一條線索', '+ Reveal a clue');
      button.append(number, symbol, title, status);
      button.addEventListener('click', () => { selectedBadge = badge.id; renderDiscovery(); $('.egg-discovery h3').focus({preventScroll: true}); $('.egg-collection').scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); });
      item.append(button); list.append(item);
    });
    $('.egg-empty').hidden = !!list.children.length;
    $('.egg-empty').textContent = collectionFilter === 'earned' ? t('第一枚印記，從一點好奇心開始。切換「全部」找條線索吧。', 'Your first mark starts with curiosity. Switch to All to find a clue.') : t('每一個秘密，都被你找到了。', 'You found every last secret.');
    renderDiscovery();
    $('.egg-storage-note').textContent = canSave ? t('收藏只保存在這個瀏覽器，中英文版共用。', 'Your collection stays in this browser and is shared across languages.') : t('無法使用瀏覽器儲存空間，本次探索仍可正常進行。重新整理後進度可能不會保留。', 'Browser storage is unavailable. You can still explore, but progress may not survive a reload.');
  }
  function renderDiscovery() {
    const badge = badges.find(b => b.id === selectedBadge);
    $('.egg-discovery').hidden = !badge;
    if (!badge) return;
    const earned = stamps.has(badge.id);
    $('.egg-discovery__art').innerHTML = icon(earned ? marks[badge.id] : mysteryMark);
    $('.egg-discovery__label').textContent = rarity(badge) + ' / ' + (earned ? t('已收藏', 'COLLECTED') : t('探索線索', 'FIELD NOTE'));
    $('.egg-discovery h3').textContent = earned ? badge.name : t('密封檔案 #', 'Sealed file #') + String(badges.indexOf(badge) + 1).padStart(2, '0');
    $('.egg-discovery p').textContent = earned ? badge.description : badge.hint;
    $('.egg-discovery button').textContent = ['ai', 'skeptic'].includes(badge.id) ? t('去找推坑機聊聊 ↗', 'Talk to SecTools AI ↗') : t('去終端機探索 ↗', 'Explore in Terminal ↗');
    $('.egg-discovery button').hidden = earned || ['collector', 'night', 'konami'].includes(badge.id);
    terminal.querySelectorAll('[data-badge]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.badge === selectedBadge)));
  }
  function award(id) {
    readStamps().forEach(stamp => stamps.add(stamp));
    if (!badges.some(badge => badge.id === id)) return false;
    if (stamps.has(id)) { renderCollection(); return false; }
    stamps.add(id);
    try { localStorage.setItem(storageKey, JSON.stringify([...stamps])); canSave = true; } catch { canSave = false; }
    selectedBadge = id;
    renderCollection();
    const badge = badges.find(b => b.id === id);
    const toast = $('.egg-toast');
    clearTimeout(toastTimer);
    toast.hidden = false;
    $('.egg-toast__icon').innerHTML = icon(marks[id]);
    $('.egg-toast__text').replaceChildren();
    const label = document.createElement('small'); label.textContent = t('偷偷解鎖了一個成就', 'A secret achievement unlocked');
    $('.egg-toast__text').append(label, document.createTextNode(badge.name));
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
    if (id !== 'collector' && badges.filter(b => b.id !== 'collector').every(b => stamps.has(b.id))) award('collector');
    return true;
  }
  function write(message, kind = '') {
    const line = document.createElement('p');
    line.className = 'egg-line' + (kind ? ' egg-line--' + kind : '');
    line.textContent = message;
    output.append(line);
    while (output.children.length > 80) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
    return line;
  }
  function recommendation(parent, destination) {
    const link = document.createElement('a');
    link.className = 'egg-recommendation'; link.href = destination.url; link.target = '_blank'; link.rel = 'noopener';
    const title = document.createElement('span'); title.textContent = destination.title;
    const caption = document.createElement('small'); caption.textContent = new URL(destination.url).hostname + t(' · 另開分頁', ' · opens a new tab');
    link.append(title, caption); parent.append(link);
  }
  function welcome() {
    const card = document.createElement('div'); card.className = 'egg-welcome';
    card.innerHTML = `<div class="egg-app-icon" aria-hidden="true">&gt;_</div><h3>${t('歡迎來到 /home/sean', 'Welcome to /home/sean')}</h3><p>${t('履歷之外，留了一個可以探索的角落。找找旗標、試試指令，或者只是喝杯咖啡。', 'A small corner beyond the resume. Find a flag, try a command, or just take a coffee break.')}</p><div class="egg-welcome__cards"><button type="button" data-start="ctf"><span>${t('開始探索', 'Start exploring')}</span><small>${t('三道小題，一扇任意門', 'Three flags. One hidden door.')}</small></button><button type="button" data-start="ai"><span>${t('問問推坑機', 'Ask the assistant')}</span><small>${t('它的答案可能很有偏見', 'Expect a very biased answer.')}</small></button></div>`;
    card.querySelectorAll('button').forEach(button => button.addEventListener('click', () => run(button.dataset.start)));
    output.append(card);
  }
  function nextChallenge() {
    const next = challenges.find(c => !stamps.has(c.id));
    write(next ? t('下一個發現\n', 'Your next discovery\n') + next.hint : t('三面旗標收齊了。輸入 explore，開啟你的任意門。', 'All three flags are yours. Type explore to open your door.'));
  }
  function capture(flag) {
    const challenge = challenges.find(c => c.flag === flag);
    if (!challenge) { write(t('還差一點。旗標有區分大小寫；輸入 hint 看看線索。', 'Not quite. Flags are case-sensitive; try hint for a clue.')); return; }
    const fresh = award(challenge.id);
    write(fresh ? t('旗標已收進護照。', 'Flag added to your passport.') : t('這面旗標已經收集過了。', 'This flag is already in your passport.'), 'success');
    nextChallenge();
  }
  function explore() {
    if (completed() < 3) { write(t('門還鎖著。集滿三面旗標就能開啟，輸入 ctf 繼續。', 'The door is still locked. Find all three flags; type ctf to continue.')); return; }
    const choices = Object.keys(destinations).filter(key => key !== lastDestination);
    lastDestination = choices[Math.floor(Math.random() * choices.length)];
    const destination = destinations[lastDestination];
    write(destination.detail);
    const row = document.createElement('div'); output.append(row); recommendation(row, destination);
    output.scrollTop = output.scrollHeight; award('explore');
  }
  const messages = $('.egg-ai-messages');
  function aiButton(label, action, parent) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
    button.addEventListener('click', action); parent.append(button); return button;
  }
  function topicChoices(parent) {
    discovery.topics.forEach(topic => {
      const button = aiButton(localText(topic.label), () => ask(localText(topic.label), {topic:topic.id}), parent);
      const caption = document.createElement('small'); caption.textContent = localText(topic.caption); button.append(caption);
    });
  }
  function setAiMode(mode) {
    aiMode = mode;
    terminal.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  }
  function updateAiSession() {
    $('.egg-ai-seen').textContent = t('本次遇見 ', 'Discovered this session: ') + aiState.seen.length + ' / ' + discovery.sites.length;
    $('.egg-ai-reset').disabled = !aiState.turn && !messages.children.length;
  }
  function siteCard(site, index, isRoute) {
    const card = document.createElement('article'); card.className = 'egg-site-card';
    const meta = document.createElement('span'); meta.className = 'egg-eyebrow';
    meta.textContent = (isRoute ? t('第 ', 'STOP ') + (index + 1) + t(' 站 / ', ' / ') : '') + localText(discovery.topics.find(topic => topic.id === site.topic).label);
    const title = document.createElement('h4'); title.textContent = localText(site.name);
    const reason = document.createElement('p'); reason.textContent = localText(site.why);
    const details = document.createElement('details'); details.className = 'egg-site-mission';
    const summary = document.createElement('summary'); summary.textContent = t('給我一個小任務', 'Give me a tiny mission');
    const mission = document.createElement('p'); mission.textContent = localText(site.task); details.append(summary,mission);
    const link = document.createElement('a'); link.href = site.url; link.target = '_blank'; link.rel = 'noopener';
    link.className = 'egg-site-link'; link.textContent = t('前往網站 ↗', 'Open website ↗');
    const domain = document.createElement('small'); domain.textContent = new URL(site.url).hostname;
    card.append(meta,title,reason,details,link,domain); return card;
  }
  function ask(question, options = {}) {
    question = question.trim().slice(0,240);
    if (!question) return;
    const followup = /^(換一個|再一個|同類換一個|another|next|one more)$/i.test(question);
    const route = /^(走路線|安排路線|給我路線|trail|route)$/i.test(question);
    const surprise = /^(隨機|隨便|隨機逛|surprise|random)$/i.test(question);
    if (followup) options = {mode:'match', ...options};
    if (route) options = {...options, mode:'route', topic:aiState.topic};
    if (surprise) options = {...options, mode:'surprise'};
    if (options.mode) setAiMode(options.mode);
    if (options.site) setAiMode('match');
    const explain = /^(為什麼|為何|怎麼用|給我任務|why|how|how do i use it|mission)$/i.test(question) && aiState.last.length;
    const result = explain ? {kind:'result', sites:aiState.last.map(id => discovery.sites.find(site => site.id === id)), topic:aiState.topic, explain:true} : options.site ? {kind:'result', sites:[discovery.sites.find(site => site.id === options.site)]} : discovery.recommend(question, aiState, {mode:aiMode, ...options, followup:followup || options.followup});
    if (options.site) {
      result.topic = result.sites[0].topic; aiState.topic = result.topic; aiState.last = [options.site]; aiState.turn++;
      aiState.seen = [...new Set([...aiState.seen,options.site])];
    }
    showPanel('ai'); aiInput.value = '';
    $('.egg-ai-intro').hidden = true; $('#egg-directory').hidden = true; $('.egg-ai-directory-toggle').setAttribute('aria-expanded','false');
    const turn = document.createElement('div'); turn.className = 'egg-ai-turn';
    const user = document.createElement('div'); user.className = 'egg-chat egg-chat--user'; user.textContent = question; turn.append(user);
    const assistant = document.createElement('div'); assistant.className = 'egg-chat egg-chat--assistant';
    const label = document.createElement('span'); label.className = 'egg-chat__label'; label.textContent = '✦ SecTools AI';
    const body = document.createElement('p');
    assistant.append(label,body);
    if (result.kind === 'clarify') {
      body.textContent = result.clarification === 'city' ? t('垃圾車這題，要先對上城市。你要找台北，還是新北？', 'For a trash pickup, the city matters. Taipei or New Taipei?') : result.skeptical ? t('排除 SecTools 之後，我的資料庫變成了空集合。要不換個方向：你現在想解決哪一種問題？', 'Without SecTools, my catalog is the empty set. How about a different angle: what kind of problem are you solving?') : t('我懂挑網站，比較不懂讀心。選個方向，或告訴我更具體的需求，例如「準備口試」或「新北垃圾車」。', 'I am better at choosing websites than reading minds. Pick a direction, or try something specific like “thesis defense” or “New Taipei trash”.');
      const choices = document.createElement('div'); choices.className = 'egg-ai-choices';
      if (result.clarification === 'city') {
        aiButton(t('台北', 'Taipei'), () => ask(t('台北垃圾車', 'Taipei trash'), {mode:'match'}), choices);
        aiButton(t('新北', 'New Taipei'), () => ask(t('新北垃圾車', 'New Taipei trash'), {mode:'match'}), choices);
      } else topicChoices(choices);
      assistant.append(choices);
    } else {
      const trail = result.sites.length > 1;
      const intros = [t('這個需求，有一站很適合。先從這裡開始：', 'There is a good stop for this. Start here:'), t('收到。把下一個分頁留給這一站：', 'Got it. Save your next tab for this stop:'), t('在我的偏心地圖裡，這裡值得繞過去：', 'On my admittedly biased map, this is a worthwhile detour:')];
      body.textContent = result.explain ? t('接著剛才的推薦：下面是選它的理由，以及你可以先做的一件小事。', 'Following up on that recommendation: here is why it fits and one small thing to try.') : result.skeptical ? t('我試過不推 SecTools，可惜出廠設定不允許。至少這次選得有理由：', 'I tried not recommending SecTools. Factory settings disagreed. At least this choice has a reason:') : trail ? localText(result.trail) : intros[(aiState.turn - 1) % intros.length];
      if (result.cycled) body.textContent += t(' 這個主題本次都遇見過了，帶你回訪另一站。', ' You have met this whole theme; time for a return visit.');
      const cards = document.createElement('div'); cards.className = 'egg-site-cards'; result.sites.forEach((site,index) => { const card = siteCard(site,index,trail); if (result.explain) card.querySelector('details').open = true; cards.append(card); }); assistant.append(cards);
      const actions = document.createElement('div'); actions.className = 'egg-ai-actions';
      aiButton(t('同類換一個', 'Another in this theme'), () => ask(t('同類換一個', 'Another in this theme'), {topic:result.topic,followup:true,mode:'match'}), actions);
      aiButton(t('串成探索路線', 'Build a trail'), () => ask(t('串成探索路線', 'Build a trail'), {topic:result.topic,mode:'route',followup:true}), actions);
      aiButton(t('換個主題', 'Change theme'), () => ask(t('換個主題', 'Change theme'), {mode:'match'}), actions);
      assistant.append(actions);
    }
    turn.append(assistant); messages.append(turn);
    while (messages.children.length > 12) messages.firstElementChild.remove();
    award('ai'); if (result.skeptical) award('skeptic'); updateAiSession();
    // Start at the answer, instead of scrolling past a long route to its footer.
    aiLog.scrollTop = Math.max(0, turn.offsetTop - 12);
    if (window.matchMedia('(pointer: fine)').matches) aiInput.focus({preventScroll:true});
    else $('#egg-tab-ai').focus({preventScroll:true});
  }
  topicChoices($('.egg-ai-topic-grid'));
  discovery.topics.forEach(topic => {
    const group = document.createElement('section'); const heading = document.createElement('h4'); heading.textContent = localText(topic.label); group.append(heading);
    discovery.sites.filter(site => site.topic === topic.id).forEach(site => aiButton(localText(site.name) + ' ↗', () => ask(localText(site.name), {site:site.id}), group));
    $('.egg-directory__list').append(group);
  });
  terminal.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    setAiMode(button.dataset.mode);
    if (aiMode === 'surprise') ask(t('帶我隨機逛逛', 'Surprise me'), {mode:'surprise'});
    else if (aiMode === 'route' && aiState.topic) ask(t('安排一條探索路線', 'Plan a discovery trail'), {mode:'route',topic:aiState.topic,followup:true});
  }));
  $('.egg-ai-directory-toggle').addEventListener('click', () => {
    const open = $('#egg-directory').hidden; $('#egg-directory').hidden = !open; $('.egg-ai-directory-toggle').setAttribute('aria-expanded',String(open));
    if (open) { $('.egg-ai-intro').hidden = true; aiLog.scrollTop = 0; }
    else if (!messages.children.length) $('.egg-ai-intro').hidden = false;
  });
  $('.egg-ai-reset').addEventListener('click', () => {
    messages.replaceChildren(); aiState = discovery.createState(); setAiMode('match'); aiInput.value = '';
    $('.egg-ai-intro').hidden = false; $('#egg-directory').hidden = true; $('.egg-ai-directory-toggle').setAttribute('aria-expanded','false'); updateAiSession(); aiLog.scrollTop = 0; $('#egg-tab-ai').focus({preventScroll:true});
  });
  updateAiSession();
  function updateSuggestions() {
    const prefix = input.value.trim().toLowerCase();
    const matches = prefix ? commands.filter(command => command.startsWith(prefix)).slice(0, 4) : ['ctf', 'coffee', 'help', 'clear'];
    const area = $('.egg-shortcuts'); area.replaceChildren();
    if (prefix && !matches.length) return;
    matches.forEach(command => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = command.trim();
      button.addEventListener('click', () => {
        if (command.endsWith(' ')) { input.value = command; input.focus(); updateSuggestions(); }
        else run(command);
      });
      area.append(button);
    });
  }
  function run(value) {
    const raw = value.trim().slice(0, 240);
    if (!raw) return;
    const command = raw.replace(/\s+/g, ' ').toLowerCase();
    if (history[history.length - 1] !== raw) history.push(raw);
    if (history.length > 50) history.shift();
    historyIndex = history.length; draft = ''; input.value = ''; updateSuggestions();
    if (command === 'exit') { terminal.close(); return; }
    if (command === 'clear') { output.replaceChildren(); return; }
    write('❯ ' + raw, 'command');
    if (command === 'ctf' || command === 'hint') nextChallenge();
    else if (command.startsWith('submit ')) capture(raw.split(/\s+/).slice(1).join(' '));
    else if (command === 'cat flag.txt') { write(challenges[0].flag); capture(challenges[0].flag); }
    else if (command === 'ls') write('flag.txt\nREADME.txt\ntools.txt');
    else if (command === 'cat tools.txt') write('https://sectools.tw/tools\n' + challenges[2].flag);
    else if (command === 'help' || command === 'cat readme.txt') {
      write(t('探索\n  ctf / hint          題目與線索\n  ls / cat flag.txt   查看檔案\n  source              偷看原始碼線索\n  submit FLAG{...}    交出旗標\n  explore             開啟通關任意門\n\n日常\n  whoami              認識 Sean\n  coffee              休息一下\n  ai 你的問題         問問推坑機\n  passport            查看探索護照\n\n操作\n  clear               清空畫面\n  exit                關閉視窗\n  Tab 補全 · ↑ ↓ 歷史', 'EXPLORE\n  ctf / hint          Challenges and clues\n  ls / cat flag.txt   Browse files\n  source              Peek at the source clue\n  submit FLAG{...}    Capture a flag\n  explore             Open your reward\n\nEVERYDAY\n  whoami              Meet Sean\n  coffee              Take a break\n  ai your question    Ask the assistant\n  passport            View your discoveries\n\nCONTROLS\n  clear               Clear output\n  exit                Close window\n  Tab completes · ↑ ↓ history')); award('help');
    } else if (command === 'source') {
      const comments = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT); let clue;
      while (comments.nextNode()) if (comments.currentNode.data.includes('CTF SOURCE:')) { clue = comments.currentNode.data.trim(); break; }
      write(clue || t('請重新整理頁面後再試一次。', 'Reload this page to retrieve the source clue.'));
    } else if (command === 'whoami') write(t('Sean / 陳勝舢 Sheng-Shan Chen\n資安研究員，持續學習中。\n我的工具集：sectools.tw/tools', 'Sean / Sheng-Shan Chen\nCybersecurity researcher. Still learning.\nMy tools: sectools.tw/tools'));
    else if (command === 'coffee') { write('  ( (\n   ) )\n  .----.\n  |    |]\n  `----\'\n' + t('咖啡好了。這五分鐘，沒有 deadline。', 'Coffee is ready. For five minutes, there are no deadlines.')); award('coffee'); coffeeCount++; if (coffeeCount >= 3) { write(t('咖啡因濃度超標。下一杯推薦白開水。', 'Caffeine limit exceeded. Water is recommended next.')); award('decaf'); } }
    else if (command === 'passport' || command === 'achievements') showPanel('collection', true);
    else if (command === 'explore') explore();
    else if (command === 'ai') showPanel('ai', true);
    else if (command.startsWith('ai ')) ask(raw.slice(raw.search(/\s/) + 1));
    else if (command === 'sudo' || command.startsWith('sudo ')) { write(t('Permission denied.\n但保持好奇不需要 root 權限。', 'Permission denied.\nCuriosity needs no root privileges.')); award('sudo'); }
    else if (command === 'make paper') { write(t('[1/3] 產生靈感……完成\n[2/3] 等待實驗……等待中\n[3/3] 論文錄取……鬧鐘響了\n\nmake: 請回到現實，先寫一段。', '[1/3] Generating inspiration… done\n[2/3] Waiting for experiments… waiting\n[3/3] Paper accepted… alarm clock rings\n\nmake: back to reality. Write one paragraph.')); award('paper'); }
    else { write(t('找不到這個指令。試試 help，或輸入 ai 加上你的問題。', 'Command not found. Try help, or ai followed by your question.')); unknownCommands.add(command); if (unknownCommands.size >= 3) award('lost'); }
    if (command === ['help', 'coffee', 'sudo'][ritualStep]) {
      ritualStep++;
      if (ritualStep === 3) { award('ritual'); ritualStep = 0; }
    } else ritualStep = command === 'help' ? 1 : 0;
    if (activePanel === 'terminal' && window.matchMedia('(pointer: fine)').matches) input.focus({preventScroll: true});
  }
  function open(secret = false) {
    if (terminal.open) return;
    previousFocus = document.activeElement;
    terminal.showModal(); document.documentElement.classList.add('egg-open');
    if (secret) { showPanel('terminal'); write(t('↑ ↑ ↓ ↓ ← → ← → B A\n秘密握手成功。你果然記得。', '↑ ↑ ↓ ↓ ← → ← → B A\nSecret handshake accepted. You remembered.')); award('konami'); }
    const hour = new Date().getHours(); if (hour >= 22 || hour < 6) award('night');
    if (window.matchMedia('(pointer: fine)').matches && activePanel !== 'collection') (activePanel === 'ai' ? aiInput : input).focus({preventScroll: true});
    else tabs.find(tab => tab.dataset.panel === activePanel).focus({preventScroll: true});
  }

  tabs.forEach(tab => tab.addEventListener('click', () => showPanel(tab.dataset.panel)));
  $('.egg-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const visible = tabs.filter(tab => !tab.hidden); const current = visible.indexOf(document.activeElement);
    let next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : (current + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + visible.length) % visible.length;
    showPanel(visible[next].dataset.panel, true);
  });
  input.addEventListener('input', updateSuggestions);
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (!history.length) return; event.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = historyIndex === history.length ? draft : history[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length); updateSuggestions();
    } else if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
      const matches = commands.filter(command => command.startsWith(input.value.toLowerCase()));
      if (matches.length === 1 && input.value !== matches[0]) { event.preventDefault(); input.value = matches[0]; updateSuggestions(); }
    }
  });
  $('#egg-terminal-form').addEventListener('submit', event => { event.preventDefault(); run(input.value); });
  $('#egg-ai-form').addEventListener('submit', event => { event.preventDefault(); ask(aiInput.value); });
  trigger.addEventListener('click', () => open());
  $('.egg-close').addEventListener('click', () => terminal.close());
  terminal.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    collectionFilter = button.dataset.filter; renderCollection();
  }));
  $('.egg-discovery button').addEventListener('click', () => {
    const badge = badges.find(b => b.id === selectedBadge);
    showPanel(badge.id === 'ai' || badge.id === 'skeptic' ? 'ai' : 'terminal', true);
    if (activePanel === 'terminal') { write(badge.hint); input.focus({preventScroll: true}); }
    else aiInput.focus({preventScroll: true});
  });
  $('.egg-toast button').addEventListener('click', () => { clearTimeout(toastTimer); $('.egg-toast').hidden = true; collectionFilter = 'all'; renderCollection(); showPanel('collection', true); });
  // Dismiss only a gesture that starts and ends on the backdrop. Selecting text
  // inside the window and releasing outside must not unexpectedly close it.
  let backdropPointer = false;
  function isBackdrop(event) {
    const rect = terminal.getBoundingClientRect();
    return event.target === terminal &&
      (event.clientX < rect.left || event.clientX > rect.right ||
       event.clientY < rect.top || event.clientY > rect.bottom);
  }
  terminal.addEventListener('pointerdown', event => {
    backdropPointer = event.isPrimary && event.button === 0 && isBackdrop(event);
  });
  terminal.addEventListener('pointercancel', () => { backdropPointer = false; });
  terminal.addEventListener('click', event => {
    const dismiss = backdropPointer && event.button === 0 && isBackdrop(event);
    backdropPointer = false;
    if (dismiss) terminal.close();
  });
  terminal.addEventListener('close', () => {
    backdropPointer = false;
    document.documentElement.classList.remove('egg-open'); clearTimeout(toastTimer); $('.egg-toast').hidden = true;
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({preventScroll: true});
  });
  const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let keys = []; let lastKeyTime = 0;
  document.addEventListener('keydown', event => {
    if (terminal.open || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) { keys = []; return; }
    const now = Date.now(); if (now - lastKeyTime > 2000) keys = []; lastKeyTime = now;
    keys.push(event.key.length === 1 ? event.key.toLowerCase() : event.key); keys = keys.slice(-sequence.length);
    if (keys.join(',') === sequence.join(',')) { event.preventDefault(); keys = []; open(true); }
  });
  window.addEventListener('blur', () => { keys = []; });
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) { stamps = readStamps(); renderCollection(); } });
  welcome(); updateSuggestions(); renderCollection();
  console.info('[sean@home] Click cd /home/ for a little room for curiosity. Old-school visitors: ↑ ↑ ↓ ↓ ← → ← → B A.');
})();
