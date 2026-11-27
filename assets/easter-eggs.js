/* Browser-only toy shell: commands are an allowlist, never evaluated or sent. */
(() => {
  const footer = document.querySelector('.footer');
  if (!footer || typeof HTMLDialogElement === 'undefined') return;
  const en = document.documentElement.lang.startsWith('en');
  const copy = en ? {
    open: 'Explore the hidden terminal', close: 'Close terminal', input: 'Command', run: 'Run',
    welcome: 'You found a quiet corner of /home/sean.\nA toy terminal for curious visitors. Type help to explore.',
    help: 'help · show commands\nwhoami · meet the human\nls · look around\ncat flag.txt · capture the flag\ncoffee · take a break\nclear · clear the screen\nexit · return to the resume',
    whoami: 'Sean / Sheng-Shan Chen\nCybersecurity researcher. Still curious, always learning.',
    flag: 'FLAG{stay_curious_stay_kind}\nFlag captured. Curiosity is a good starting point.',
    coffee: '  ( (\n   ) )\n  .----.\n  |    |]\n  `----\'\nCoffee break unlocked. Take a breath; the bugs can wait.',
    unknown: 'Command not found. Try help.',
    konami: '↑ ↑ ↓ ↓ ← → ← → B A\nSecret handshake accepted. +30 curiosity.\nTry cat flag.txt for your next discovery.'
  } : {
    open: '探索隱藏終端機', close: '關閉終端機', input: '指令', run: '執行',
    welcome: '你找到 /home/sean 的隱藏角落了。\n這是留給好奇訪客的迷你終端機。輸入 help 開始探索。',
    help: 'help · 查看指令\nwhoami · 認識一下本人\nls · 看看有什麼\ncat flag.txt · 取得旗標\ncoffee · 休息一下\nclear · 清空畫面\nexit · 回到履歷',
    whoami: 'Sean / 陳勝舢 Sheng-Shan Chen\n資安研究員。保持好奇，持續學習中。',
    flag: 'FLAG{stay_curious_stay_kind}\n成功奪旗。保持好奇，也記得保持善意。',
    coffee: '  ( (\n   ) )\n  .----.\n  |    |]\n  `----\'\n咖啡時間解鎖。喘口氣，Bug 可以等一下。',
    unknown: '找不到這個指令，試試 help。',
    konami: '↑ ↑ ↓ ↓ ← → ← → B A\n秘密握手成功，好奇心 +30。\n試試 cat flag.txt，還有一個小發現。'
  };

  const challenges = [
    { id: 'terminal', flag: 'FLAG{stay_curious_stay_kind}', name: en ? 'First flag' : '第一次奪旗', hint: en ? 'Look around with ls, then read flag.txt.' : '用 ls 看看，再讀取 flag.txt。' },
    { id: 'source', flag: 'FLAG{read_between_the_tags}', name: en ? 'Source explorer' : '原始碼探索者', hint: en ? 'Look for CTF SOURCE in the HTML source. On mobile, type source.' : '在 HTML 原始碼找 CTF SOURCE；手機可輸入 source。' },
    { id: 'team', flag: 'FLAG{sean_and_yuki}', name: en ? 'Meet the maintainers' : '認識共同維護者', hint: en ? 'Read the maintenance credit at the bottom of this page. Format: FLAG{first_english_name_and_second_english_name}, all lowercase.' : '答案在頁面底部的共同維護署名。格式：FLAG{第一位英文名_and_第二位英文名}，名字都用小寫。' }
  ];
  const badges = [...challenges, { id: 'coffee', name: en ? 'Coffee break' : '咖啡休息' }, { id: 'konami', name: en ? 'Secret handshake' : '秘密握手' }];
  const storageKey = 'sean-easter-passport-v1';
  let stamps = new Set();
  let canSave = true;
  function readStamps() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return new Set(Array.isArray(saved) ? saved.filter(id => badges.some(badge => badge.id === id)) : []);
    } catch { canSave = false; return new Set(); }
  }
  stamps = readStamps();
  const completed = () => challenges.filter(challenge => stamps.has(challenge.id)).length;
  const destinations = [
    { url: 'https://sectools.tw/tools', title: en ? 'SecTools tool collection' : 'SecTools 神奇無用工具集', why: en ? 'Pick a tool or a small distraction for your next break.' : '從工具到研究生日常，挑一個讓自己休息一下。' },
    { url: 'https://sectools.tw/archives/1', title: en ? 'The story of SecTools' : 'SecTools 的故事', why: en ? 'See how this shared project grew.' : '看看這個共同維護的網站一路走來的故事。' },
    { url: 'https://gacha-sho.sectools.tw/', title: en ? 'Cyber threat gacha' : '資安威脅扭蛋機', why: en ? 'Turn a capsule and discover a cyber threat story.' : '轉一顆扭蛋，認識一種資安威脅。' }
  ];
  let lastDestination = -1;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'egg-trigger';
  trigger.textContent = '>_';
  trigger.title = copy.open;
  trigger.setAttribute('aria-label', copy.open);
  trigger.setAttribute('aria-haspopup', 'dialog');
  footer.append(trigger);

  const terminal = document.createElement('dialog');
  terminal.className = 'egg-terminal';
  terminal.setAttribute('aria-labelledby', 'egg-title');
  terminal.innerHTML = `
    <div class="egg-terminal__header">
      <h2 class="egg-terminal__title" id="egg-title">visitor@sean:~</h2>
      <button type="button" class="egg-terminal__close" aria-label="${copy.close}">×</button>
    </div>
    <p class="egg-terminal__passport"></p>
    <div class="egg-terminal__output" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="${en ? 'Terminal output' : '終端機輸出'}"></div>
    <form class="egg-terminal__form">
      <label for="egg-command"><span aria-hidden="true">$</span><span hidden>${copy.input}</span></label>
      <input id="egg-command" aria-label="${copy.input}" maxlength="120" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send">
      <button type="submit">${copy.run}</button>
    </form>
    <div class="egg-terminal__hints"></div>
    <p class="egg-terminal__more"><a href="https://sectools.tw/" target="_blank" rel="noopener">SecTools.tw</a>${en ? ' is jointly maintained by Sheng-Shan Chen (Sean) and ' : ' 由陳勝舢（Sean）與 '}<a href="https://sectools.tw/about/yuki" target="_blank" rel="noopener">Yuki</a>${en ? '.' : ' 共同維護。'}</p>`;
  document.body.append(terminal);
  const output = terminal.querySelector('[role="log"]');
  const input = terminal.querySelector('input');
  let previousFocus;

  function updatePassport() {
    terminal.querySelector('.egg-terminal__passport').textContent =
      (en ? 'Explorer passport' : '探索護照') + ' · CTF ' + completed() + '/3 · ' +
      (en ? 'bonus ' : '彩蛋 ') + badges.slice(3).filter(badge => stamps.has(badge.id)).length + '/2';
  }
  updatePassport();

  function award(id) {
    // Merge saved stamps so another tab's discoveries are not overwritten.
    readStamps().forEach(stamp => stamps.add(stamp));
    if (stamps.has(id)) { updatePassport(); return false; }
    stamps.add(id);
    try { localStorage.setItem(storageKey, JSON.stringify([...stamps])); canSave = true; }
    catch { canSave = false; }
    updatePassport();
    write((en ? 'Stamp earned: ' : '獲得印章：') + badges.find(badge => badge.id === id).name);
    if (completed() === 3 && challenges.some(challenge => challenge.id === id)) {
      write(en ? 'All flags captured! Thanks for exploring. Type explore to open a door into SecTools, maintained by Sean and Yuki.' : '三面旗標收集完成！謝謝你保持好奇。輸入 explore，解鎖 Sean 與 Yuki 共同維護的 SecTools 任意門。');
    }
    return true;
  }

  function passport() {
    write(badges.map(badge => (stamps.has(badge.id) ? '[✓] ' : '[ ] ') + badge.name).join('\n'));
    write(canSave ? (en ? 'Progress stays in this browser.' : '進度只存於這個瀏覽器。') : (en ? 'Browser storage is unavailable; progress lasts for this page session.' : '瀏覽器儲存空間無法使用，進度只保留在本次頁面。'));
    write(completed() === 3 ? (en ? 'Type explore to visit your next destination.' : '輸入 explore，出發前往下一站。') : (en ? 'Type ctf for the next challenge.' : '輸入 ctf 查看下一道題。'));
  }

  function explore() {
    if (completed() < 3) {
      write(en ? 'The door opens after all 3 flags. Type ctf or hint to continue.' : '收集三面旗標後開門。輸入 ctf 或 hint 繼續探索。');
      return;
    }
    const choices = destinations.map((_, index) => index).filter(index => index !== lastDestination);
    lastDestination = choices[Math.floor(Math.random() * choices.length)];
    const destination = destinations[lastDestination];
    write(destination.why);
    const line = write('');
    const link = document.createElement('a');
    link.href = destination.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = destination.title + (en ? ' (opens a new tab)' : '（另開分頁）');
    line.append(link);
    output.scrollTop = output.scrollHeight;
  }

  function write(message, command = false) {
    const line = document.createElement('p');
    line.textContent = message;
    if (command) line.className = 'egg-terminal__command';
    output.append(line);
    // Keep long play sessions small, including screen-reader history.
    while (output.children.length > 60) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
    return line;
  }

  function open(secret = false) {
    if (terminal.open) return;
    previousFocus = document.activeElement;
    terminal.showModal();
    if (!output.childElementCount) write(copy.welcome);
    if (secret) { write(copy.konami); award('konami'); }
    input.focus({ preventScroll: true });
  }

  function run(value) {
    const command = value.trim().replace(/\s+/g, ' ').toLowerCase();
    input.value = '';
    if (!command) return;
    if (command === 'clear') output.replaceChildren();
    else if (command === 'exit') terminal.close();
    else {
      write('$ ' + value.trim(), true);
      if (command === 'ctf' || command === 'hint') {
        const next = challenges.find(challenge => !stamps.has(challenge.id));
        write(next ? (en ? 'Next challenge: ' : '下一道題：') + next.name + '\n' + next.hint + '\n' + (en ? 'Submit with: submit FLAG{...}' : '找到後輸入：submit FLAG{...}') : (en ? 'All 3 flags captured. Type explore for your reward.' : '三面旗標已集滿，輸入 explore 領取獎勵。'));
      } else if (command.startsWith('submit ')) {
        const flag = value.trim().split(/\s+/).slice(1).join(' ');
        const match = challenges.find(challenge => challenge.flag === flag);
        if (!match) write(en ? 'Not quite. Flags are case-sensitive; type hint for a clue.' : '還差一點！旗標有區分大小寫，輸入 hint 取得提示。');
        else if (!award(match.id)) write(en ? 'Already stamped. Type ctf for the next challenge.' : '這面旗標已蓋章，輸入 ctf 查看下一道題。');
      } else if (command === 'passport') passport();
      else if (command === 'explore') explore();
      else if (command === 'source') {
        const comments = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
        let clue;
        while (comments.nextNode()) {
          if (comments.currentNode.data.includes('CTF SOURCE:')) { clue = comments.currentNode.data.trim(); break; }
        }
        write(clue || (en ? 'Reload the page to retrieve the source clue.' : '請重新整理頁面以取得原始碼線索。'));
      } else {
        const answers = {
          help: copy.help, whoami: copy.whoami, ls: 'flag.txt',
          'cat flag.txt': copy.flag, coffee: copy.coffee,
          'sudo': en ? 'Kindness needs no root privileges.' : '善意不需要 root 權限。'
        };
        write(Object.hasOwn(answers, command) ? answers[command] : copy.unknown);
        if (command === 'help') write('ctf · hint · source · submit FLAG{...} · passport · explore');
        if (command === 'cat flag.txt') award('terminal');
        if (command === 'coffee') award('coffee');
      }
    }
    if (terminal.open) input.focus({ preventScroll: true });
  }

  ['ctf', 'hint', 'source', 'passport', 'explore', 'help', 'coffee'].forEach(command => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = command;
    button.addEventListener('click', () => run(command));
    terminal.querySelector('.egg-terminal__hints').append(button);
  });
  trigger.addEventListener('click', () => open());
  terminal.querySelector('.egg-terminal__close').addEventListener('click', () => terminal.close());
  terminal.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    run(input.value);
  });
  terminal.addEventListener('close', () => {
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  });

  // Don't capture typing, modifier shortcuts, or ordinary arrow-key scrolling.
  const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let keys = [];
  let lastKeyTime = 0;
  document.addEventListener('keydown', event => {
    if (terminal.open || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey ||
        event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) {
      keys = [];
      return;
    }
    const now = Date.now();
    if (now - lastKeyTime > 2000) keys = [];
    lastKeyTime = now;
    keys.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    keys = keys.slice(-sequence.length);
    if (keys.join(',') === sequence.join(',')) {
      event.preventDefault(); // Don't type the final A into the newly focused input.
      keys = [];
      open(true);
    }
  });
  window.addEventListener('blur', () => { keys = []; });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) { stamps = readStamps(); updatePassport(); }
  });
  console.info('[sean@home] Curiosity looks good on you. Try ↑ ↑ ↓ ↓ ← → ← → B A, or find >_ in the footer.');
})();
