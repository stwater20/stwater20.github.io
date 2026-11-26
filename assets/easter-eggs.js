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

  function write(message, command = false) {
    const line = document.createElement('p');
    line.textContent = message;
    if (command) line.className = 'egg-terminal__command';
    output.append(line);
    // Keep long play sessions small, including screen-reader history.
    while (output.children.length > 60) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  }

  function open(secret = false) {
    if (terminal.open) return;
    previousFocus = document.activeElement;
    terminal.showModal();
    if (!output.childElementCount) write(copy.welcome);
    if (secret) write(copy.konami);
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
      const answers = {
        help: copy.help, whoami: copy.whoami, ls: 'flag.txt',
        'cat flag.txt': copy.flag, coffee: copy.coffee,
        'sudo': en ? 'Kindness needs no root privileges.' : '善意不需要 root 權限。'
      };
      write(Object.hasOwn(answers, command) ? answers[command] : copy.unknown);
    }
    if (terminal.open) input.focus({ preventScroll: true });
  }

  ['help', 'whoami', 'ls', 'coffee'].forEach(command => {
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
  console.info('[sean@home] Curiosity looks good on you. Try ↑ ↑ ↓ ↓ ← → ← → B A, or find >_ in the footer.');
})();
