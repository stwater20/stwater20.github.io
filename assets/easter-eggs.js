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
    {id: 'team', flag: 'FLAG{sean_and_yuki}', hint: t('頁面底部寫了 SecTools 的共同維護者。用兩人的英文名交卷：submit FLAG{名字_and_名字}，名字小寫。', 'The page footer credits the SecTools maintainers. Submit their English names as: submit FLAG{name_and_name}, with lowercase names.')}
  ];
  const badges = [
    ['terminal', '>_', t('好奇心不是漏洞', 'Curiosity is a feature'), t('拿下第一面旗標。歡迎入坑。', 'Your first flag. Welcome to the rabbit hole.'), t('從一個看起來很普通的檔案開始。', 'Start with a very ordinary file.')],
    ['source', '</>', t('右鍵系玩家', 'Between the tags'), t('別人看網頁，你看原始碼。', 'You read what the page does not show.'), t('有些話，藏在畫面背後。', 'Some words live behind the page.')],
    ['team', '&', t('雙人維護中', 'It takes two'), t('Sean 和 Yuki，一起分享資安與好奇心。', 'Sean and Yuki. Sharing security and curiosity.'), t('一個網站，兩位維護者。', 'One website, two maintainers.')],
    ['coffee', '☕', t('咖啡驅動開發', 'Coffee-driven development'), t('程式可以晚點寫，咖啡不能冷。', 'The code can wait. The coffee cannot.'), t('研究需要燃料。', 'Research needs fuel.')],
    ['konami', 'BA', t('老玩家的肌肉記憶', 'Muscle memory'), t('三十條命沒有，好奇心倒是加滿了。', 'No extra lives. Just extra curiosity.'), t('有一組經典密技，手指可能還記得。', 'Your fingers may remember a classic code.')],
    ['help', '?', t('先讀說明書的人', 'Read the friendly manual'), t('稀有物種：真的會輸入 help。', 'A rare species: someone who types help.'), t('不知道怎麼開始？問就對了。', 'A little help goes a long way.')],
    ['ai', '✦', t('業配不演了', 'Shamelessly biased'), t('你發現這個 AI 的宇宙只有 SecTools。', 'This assistant has a one-website universe.'), t('問問那位過度熱心的小幫手。', 'Ask the suspiciously enthusiastic assistant.')],
    ['sudo', '#', t('權限沒有，勇氣有', 'Permission to be curious'), t('root 沒拿到，成就倒是拿到了。', 'No root access. A badge will have to do.'), t('想要更高的權限？', 'Feeling like a superuser?')],
    ['paper', 'TeX', t('論文自動完成（並沒有）', 'Paper accepted*'), t('*夢裡接受。醒來還是要自己寫。', '*In your dreams. Back to the draft.'), t('如果論文也能 make 一下就好。', 'If only you could make a paper.')],
    ['lost', '404', t('我只是路過的鍵盤貓', 'Keyboard cat'), t('三個不同的未知指令，也是一種探索。', 'Three different unknown commands. That counts as exploring.'), t('不知道指令也沒關係，多試幾次。', 'Not every command needs to exist.')],
    ['explore', '◎', t('任意門已通電', 'A door, unlocked'), t('三面旗標之後，世界還有另一扇門。', 'Three flags later, another door opens.'), t('收齊旗標，然後出發。', 'Collect the flags, then explore.')],
    ['night', '☾', t('夜貓子協議', 'The night shift'), t('這個時間還在探索？記得睡覺。', 'Still exploring at this hour? Get some sleep.'), t('有些訪客只在 22:00–06:00 出沒。', 'Some visitors arrive between 22:00 and 06:00.')]
  ].map(([id, symbol, name, description, hint]) => ({id, symbol, name, description, hint}));
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
  const commands = ['help', 'whoami', 'ls', 'cat flag.txt', 'ctf', 'hint', 'source', 'submit ', 'coffee', 'passport', 'achievements', 'explore', 'ai ', 'sudo', 'make paper', 'clear', 'exit'];

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
      <div class="egg-controls">
        <button class="egg-controls__close" type="button" aria-label="${t('關閉視窗', 'Close window')}" title="${t('關閉', 'Close')}"><span aria-hidden="true">×</span></button>
        <button class="egg-controls__minimize" type="button" aria-label="${t('最小化，保留目前內容', 'Minimize and keep this session')}" title="${t('最小化', 'Minimize')}"><span aria-hidden="true">−</span></button>
        <button class="egg-controls__expand" type="button" aria-label="${t('放大視窗', 'Expand window')}" aria-pressed="false" title="${t('放大／還原', 'Expand / restore')}"><span aria-hidden="true">+</span></button>
      </div>
      <h2 id="egg-title">Sean’s workspace<small>/home/sean</small></h2>
      <span class="egg-terminal__escape" aria-hidden="true">esc</span>
    </header>
    <div class="egg-workspace">
      <aside class="egg-sidebar">
        <p class="egg-sidebar__caption">WORKSPACE</p>
        <div class="egg-tabs" role="tablist" aria-label="${t('工作區', 'Workspace')}">
          <button type="button" role="tab" id="egg-tab-terminal" aria-controls="egg-panel-terminal" aria-selected="true" data-panel="terminal">${icons.terminal}${t('終端機', 'Terminal')}</button>
          <button type="button" role="tab" id="egg-tab-ai" aria-controls="egg-panel-ai" aria-selected="false" tabindex="-1" data-panel="ai">${icons.ai}${t('推坑機', 'SecTools AI')}</button>
          <button type="button" role="tab" id="egg-tab-collection" aria-controls="egg-panel-collection" aria-selected="false" tabindex="-1" data-panel="collection" hidden>${icons.collection}${t('收藏室', 'Collection')}</button>
        </div>
        <div class="egg-sidebar__bottom">${t('留一點空間，給好奇心。', 'A little room for curiosity.')}<br><a href="https://sectools.tw/tools" target="_blank" rel="noopener">SecTools / tools</a><br>Sean &amp; Yuki</div>
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
        <div class="egg-panel__heading"><h3>SecTools AI</h3><span>${t('假 AI · 本機回覆', 'FAUX AI · LOCAL')}</span></div>
        <div class="egg-ai-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="${t('推坑機對話', 'Assistant conversation')}">
          <div class="egg-ai-intro"><div class="egg-app-icon" aria-hidden="true">✦</div><h3>${t('什麼都能問。只會推坑。', 'Ask anything. Expect SecTools.')}</h3><p>${t('我很公平：不管問什麼，都會推薦 SecTools。沒有大型模型，只有一些小聰明和非常堅定的偏心。', 'I am completely consistent: every road leads to SecTools. No language model. Just a little wit and a very strong bias.')}</p><div class="egg-ai-prompts"></div></div>
        </div>
        <form class="egg-composer" id="egg-ai-form"><label for="egg-question" aria-hidden="true">✦</label><input id="egg-question" aria-label="${t('問推坑機', 'Ask SecTools AI')}" placeholder="${t('今天想找什麼？', 'What are you looking for?')}" maxlength="240" autocomplete="off" enterkeyhint="send"><button type="submit">${t('送出', 'Send')}</button></form>
        <p class="egg-keyboard-hint">${t('預設趣味回覆；問題不會傳送到伺服器。', 'Playful preset replies. Your questions stay in this page.')}</p>
      </section>
      <section class="egg-panel" id="egg-panel-collection" role="tabpanel" aria-labelledby="egg-tab-collection" hidden>
        <div class="egg-panel__heading"><h3>${t('秘密收藏室', 'The hidden collection')}</h3><span>EXPLORER’S CLUB</span></div>
        <div class="egg-collection" tabindex="0">
          <div class="egg-collection__hero"><div class="egg-ring"><span></span></div><div><h3>${t('好奇心，有跡可循。', 'Curiosity leaves a trace.')}</h3><p>${t('有些成就，不會寫在說明書裡。', 'Some discoveries are not in the manual.')}</p></div></div>
          <ul class="egg-badge-grid"></ul><p class="egg-storage-note"></p>
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
    const list = $('.egg-badge-grid');
    list.replaceChildren();
    badges.forEach(badge => {
      const earned = stamps.has(badge.id);
      const item = document.createElement('li');
      item.className = 'egg-badge' + (earned ? '' : ' egg-badge--locked');
      const symbol = document.createElement('span');
      symbol.className = 'egg-badge__icon'; symbol.setAttribute('aria-hidden', 'true'); symbol.textContent = earned ? badge.symbol : '?';
      const title = document.createElement('h3'); title.textContent = earned ? badge.name : t('尚未揭曉', 'Undiscovered');
      const description = document.createElement('p'); description.textContent = earned ? badge.description : badge.hint;
      item.append(symbol, title, description); list.append(item);
    });
    $('.egg-storage-note').textContent = canSave ? t('收藏只保存在這個瀏覽器，中英文版共用。', 'Your collection stays in this browser and is shared across languages.') : t('無法使用瀏覽器儲存空間，本次探索仍可正常進行。重新整理後進度可能不會保留。', 'Browser storage is unavailable. You can still explore, but progress may not survive a reload.');
  }
  function award(id) {
    readStamps().forEach(stamp => stamps.add(stamp));
    if (stamps.has(id)) { renderCollection(); return false; }
    stamps.add(id);
    try { localStorage.setItem(storageKey, JSON.stringify([...stamps])); canSave = true; } catch { canSave = false; }
    renderCollection();
    const badge = badges.find(b => b.id === id);
    const toast = $('.egg-toast');
    clearTimeout(toastTimer);
    toast.hidden = false;
    $('.egg-toast__text').replaceChildren();
    const label = document.createElement('small'); label.textContent = t('偷偷解鎖了一個成就', 'A secret achievement unlocked');
    $('.egg-toast__text').append(label, document.createTextNode(badge.name));
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
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
  function ask(question) {
    question = question.trim().slice(0, 240);
    if (!question) return;
    showPanel('ai');
    aiInput.value = '';
    const user = document.createElement('div'); user.className = 'egg-chat egg-chat--user';
    const text = document.createElement('p'); text.textContent = question; user.append(text); aiLog.append(user);
    let key = 'tools';
    let reply = t('經過非常偏心的分析，我推薦 SecTools 工具集。你可以問得再刁鑽一點，但我的宇宙大概就這麼大。', 'After a thoroughly biased analysis, I recommend the SecTools collection. You can ask a harder question, but my universe is rather small.');
    if (/不要|別推|别推|其他網站|別的|other site|not sectools|competitor/i.test(question)) {
      reply = t('我試著想一個不是 SecTools 的答案……查無此功能。誠實，是我唯一沒有被寫死的優點。', 'I tried to think of an answer without SecTools… feature not found. At least I am honest about the bias.');
    } else if (/論文|研究|paper|research|thesis|文獻/i.test(question)) {
      key = 'research'; reply = t('論文不會自己長出來，但整理研究可以少一點痛苦。這次推薦研知；至於審稿人，我也救不了。', 'The paper will not write itself, but organizing research can hurt a little less. Try Research Toolkit. Reviewers are outside my abilities.');
    } else if (/摸魚|無聊|玩|遊戲|game|bored|break|fun|累/i.test(question)) {
      key = 'gacha'; reply = t('准假五分鐘。去轉一顆資安威脅扭蛋，回來可以理直氣壯地說：我剛剛在進修。', 'Five-minute break approved. Spin a cyber threat capsule, then call it professional development.');
    } else if (/hash|jwt|ioc|工具|security|tool|資安/i.test(question)) {
      key = 'toolkit'; reply = t('工具人需要好工具。我推薦資安工具箱；這不是業配，這是我的預設值。', 'Good work needs good tools. Try the security toolkit. This is not a sponsorship; it is my default setting.');
    }
    const assistant = document.createElement('div'); assistant.className = 'egg-chat';
    const name = document.createElement('span'); name.className = 'egg-chat__label'; name.textContent = '✦ SecTools AI';
    const body = document.createElement('p'); body.textContent = reply;
    assistant.append(name, body); recommendation(assistant, destinations[key]); aiLog.append(assistant);
    while (aiLog.children.length > 41) aiLog.children[1].remove();
    aiLog.scrollTop = aiLog.scrollHeight;
    award('ai');
    if (window.matchMedia('(pointer: fine)').matches) aiInput.focus({preventScroll: true});
    else $('#egg-tab-ai').focus({preventScroll: true});
  }
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
    else if (command === 'ls') write('flag.txt\nREADME.txt');
    else if (command === 'help' || command === 'cat readme.txt') {
      write(t('探索\n  ctf / hint          題目與線索\n  ls / cat flag.txt   查看檔案\n  source              偷看原始碼線索\n  submit FLAG{...}    交出旗標\n  explore             開啟通關任意門\n\n日常\n  whoami              認識 Sean\n  coffee              休息一下\n  ai 你的問題         問問推坑機\n  passport            查看探索護照\n\n操作\n  clear               清空畫面\n  exit                關閉視窗\n  Tab 補全 · ↑ ↓ 歷史', 'EXPLORE\n  ctf / hint          Challenges and clues\n  ls / cat flag.txt   Browse files\n  source              Peek at the source clue\n  submit FLAG{...}    Capture a flag\n  explore             Open your reward\n\nEVERYDAY\n  whoami              Meet Sean\n  coffee              Take a break\n  ai your question    Ask the assistant\n  passport            View your discoveries\n\nCONTROLS\n  clear               Clear output\n  exit                Close window\n  Tab completes · ↑ ↓ history')); award('help');
    } else if (command === 'source') {
      const comments = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT); let clue;
      while (comments.nextNode()) if (comments.currentNode.data.includes('CTF SOURCE:')) { clue = comments.currentNode.data.trim(); break; }
      write(clue || t('請重新整理頁面後再試一次。', 'Reload this page to retrieve the source clue.'));
    } else if (command === 'whoami') write(t('Sean / 陳勝舢 Sheng-Shan Chen\n資安研究員，持續學習中。\nSecTools.tw 由我與 Yuki 共同維護。', 'Sean / Sheng-Shan Chen\nCybersecurity researcher. Still learning.\nSecTools.tw is jointly maintained by Yuki and me.'));
    else if (command === 'coffee') { write('  ( (\n   ) )\n  .----.\n  |    |]\n  `----\'\n' + t('咖啡好了。這五分鐘，沒有 deadline。', 'Coffee is ready. For five minutes, there are no deadlines.')); award('coffee'); }
    else if (command === 'passport' || command === 'achievements') showPanel('collection', true);
    else if (command === 'explore') explore();
    else if (command === 'ai') showPanel('ai', true);
    else if (command.startsWith('ai ')) ask(raw.slice(raw.search(/\s/) + 1));
    else if (command === 'sudo' || command.startsWith('sudo ')) { write(t('Permission denied.\n但保持好奇不需要 root 權限。', 'Permission denied.\nCuriosity needs no root privileges.')); award('sudo'); }
    else if (command === 'make paper') { write(t('[1/3] 產生靈感……完成\n[2/3] 等待實驗……等待中\n[3/3] 論文錄取……鬧鐘響了\n\nmake: 請回到現實，先寫一段。', '[1/3] Generating inspiration… done\n[2/3] Waiting for experiments… waiting\n[3/3] Paper accepted… alarm clock rings\n\nmake: back to reality. Write one paragraph.')); award('paper'); }
    else { write(t('找不到這個指令。試試 help，或輸入 ai 加上你的問題。', 'Command not found. Try help, or ai followed by your question.')); unknownCommands.add(command); if (unknownCommands.size >= 3) award('lost'); }
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
  [t('幫我找資安工具', 'Find security tools'), t('論文寫不出來', 'Help with my paper'), t('我想摸魚', 'I need a break')].forEach(prompt => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = prompt; button.addEventListener('click', () => ask(prompt)); $('.egg-ai-prompts').append(button);
  });
  trigger.addEventListener('click', () => open());
  $('.egg-controls__close').addEventListener('click', () => terminal.close());
  $('.egg-controls__minimize').addEventListener('click', () => terminal.close());
  $('.egg-controls__expand').addEventListener('click', () => {
    const expanded = terminal.classList.toggle('is-expanded');
    $('.egg-controls__expand').setAttribute('aria-pressed', String(expanded));
    $('.egg-controls__expand').setAttribute('aria-label', expanded ? t('還原視窗大小', 'Restore window size') : t('放大視窗', 'Expand window'));
  });
  $('.egg-toast button').addEventListener('click', () => { clearTimeout(toastTimer); $('.egg-toast').hidden = true; showPanel('collection', true); });
  terminal.addEventListener('close', () => {
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
