/* Easter eggs: console greeting, a tiny terminal (click the `$ cd /home/` prompt
   or press `), a shy cat avatar, and the last step of a small CTF. */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var T = function (zh, en) { return EN ? en : zh; };

  // ---------- 1. Console greeting ----------
  try {
    var art = [
      '  /\\_/\\',
      ' ( o.o )   ' + T('嗨，你也是會打開 DevTools 的人。', 'hi, fellow DevTools opener.'),
      '  > ^ <'
    ].join('\n');
    console.log('%c' + art, 'font-family:monospace;font-size:14px;color:#8b5e34');
    console.log('%c' + T(
      '→ 點左上角的 $ cd /home/，或按 ` 鍵，打開終端機。\n→ 這裡藏了一面 flag，從原始碼開始找。',
      '→ Click the $ cd /home/ prompt (or press `) to open a terminal.\n→ There is a flag hidden here. Start with the page source.'
    ), 'font-family:monospace;color:#7d7167');
  } catch (e) {}

  // ---------- 2. Shy cat avatar ----------
  (function () {
    var wrap = document.querySelector('.avatar-wrap');
    if (!wrap) return;
    var clicks = 0, timer = null, busy = false;
    wrap.addEventListener('click', function () {
      if (busy) return;
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(function () { clicks = 0; }, 1500);
      wrap.classList.remove('wiggle');
      void wrap.offsetWidth; // restart the animation
      wrap.classList.add('wiggle');
      if (clicks < 5) return;
      clicks = 0;
      busy = true;
      var bubble = document.createElement('span');
      bubble.className = 'meow-bubble';
      bubble.textContent = T('喵！別戳了 >_<', 'meow! stop poking >_<');
      wrap.appendChild(bubble);
      wrap.classList.add('hiding');
      setTimeout(function () {
        wrap.classList.remove('hiding');
        bubble.remove();
        busy = false;
      }, 2600);
    });
  })();

  // ---------- 3. Mini terminal ----------
  var FLAG = 'ZmxhZ3tjNHRfMW5fN2gzX2gwbTNfZDFyfQ=='; // base64, so it is not a plain-text grep away
  var KEY = 'meow';
  var unlocked = false;
  var term, out, input, lastFocus;
  var history = [], hpos = 0;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build() {
    term = el('div', 'egg-term');
    term.setAttribute('role', 'dialog');
    term.setAttribute('aria-label', T('終端機', 'Terminal'));
    var bar = el('div', 'egg-term__bar');
    bar.appendChild(el('span', 'egg-term__dots'));
    bar.appendChild(el('span', 'egg-term__title', 'sean@stwater20: ~'));
    var close = el('button', 'egg-term__close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', T('關閉', 'Close'));
    close.addEventListener('click', hide);
    bar.appendChild(close);
    out = el('div', 'egg-term__out');
    out.setAttribute('aria-live', 'polite');
    var line = el('label', 'egg-term__line');
    line.appendChild(el('span', 'egg-term__ps', '$'));
    input = el('input', 'egg-term__in');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', T('輸入指令', 'Command'));
    line.appendChild(input);
    term.appendChild(bar);
    term.appendChild(out);
    term.appendChild(line);
    document.body.appendChild(term);
    term.addEventListener('click', function (e) { if (e.target === term || e.target === out) input.focus(); });
    input.addEventListener('keydown', onKey);
    print(T('歡迎。輸入 help 看看能做什麼。', 'Welcome. Type help to see what you can do.'), 'dim');
  }

  function print(text, cls) {
    out.appendChild(el('div', 'egg-term__row' + (cls ? ' ' + cls : ''), text));
    out.scrollTop = out.scrollHeight;
  }

  function show() {
    if (!term) build();
    lastFocus = document.activeElement;
    term.classList.add('open');
    input.focus();
  }

  function hide() {
    if (!term) return;
    term.classList.remove('open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function goTo(id) {
    var target = document.getElementById(id);
    if (!target) return false;
    hide();
    target.scrollIntoView({ behavior: 'smooth' });
    return true;
  }

  function linksText() {
    var rows = document.querySelectorAll('#links .timeline li');
    if (!rows.length) return T('（沒有資料）', '(empty)');
    return Array.prototype.map.call(rows, function (li) {
      var label = li.querySelector('.tl-date'), body = li.querySelector('.tl-body');
      return (label ? label.textContent : '') + '  ' + (body ? body.textContent : '');
    }).join('\n');
  }

  var FILES = ['about.txt', 'links.txt', 'flag.txt', 'experience/', 'publications/'];

  var COMMANDS = {
    help: function () {
      return T(
        'whoami        我是誰\nls [-a]       列出檔案\ncat <檔案>    讀檔\ncd <目錄>     跳到那一段\npwd · date · echo · history · clear\ntheme         切換淺色／深色\nunlock <key>  解鎖 flag\nexit          關閉（或按 Esc）',
        'whoami        who am I\nls [-a]       list files\ncat <file>    read a file\ncd <dir>      jump to that section\npwd · date · echo · history · clear\ntheme         toggle light/dark\nunlock <key>  unlock the flag\nexit          close (or press Esc)'
      );
    },
    whoami: function () {
      var h = document.querySelector('.post-title');
      return (h ? h.textContent.trim() : 'sean') + T('\n資安研究員 · 喜歡威脅情資，也喜歡貓。', '\nsecurity researcher · into threat intel, and cats.');
    },
    ls: function (args) {
      var list = FILES.slice();
      if (args[0] === '-a' || args[0] === '-la' || args[0] === '-al') list = ['.', '..', '.hint'].concat(list);
      return list.join('  ');
    },
    cat: function (args) {
      var f = (args[0] || '').replace(/^\.\//, '');
      if (!f) return T('cat: 要讀哪個檔案？', 'cat: which file?');
      if (f === 'about.txt') {
        var ps = document.querySelectorAll('.intro p');
        return ps.length ? ps[ps.length - 1].textContent.trim() : '';
      }
      if (f === 'links.txt') return linksText();
      if (f === '.hint') return T('老習慣：右鍵 → 檢視原始碼。', 'Old habits die hard: view-source.');
      if (f === 'flag.txt') {
        return unlocked ? atob(FLAG) : T('cat: flag.txt: 權限不足（先 unlock）', 'cat: flag.txt: Permission denied (unlock it first)');
      }
      if (/\/$/.test(f) || f === 'experience' || f === 'publications') return 'cat: ' + f + T(': 是目錄', ': Is a directory');
      return 'cat: ' + f + T(': 沒有這個檔案', ': No such file or directory');
    },
    cd: function (args) {
      var d = (args[0] || '~').replace(/\/$/, '');
      if (d === '~' || d === '/' || d === '..' || d === '.') { hide(); window.scrollTo({ top: 0, behavior: 'smooth' }); return null; }
      if ((d === 'experience' || d === 'publications') && goTo(d)) return null;
      return 'cd: ' + d + T(': 沒有這個目錄', ': No such file or directory');
    },
    pwd: function () { return '/home/sean'; },
    date: function () { return new Date().toString(); },
    echo: function (args) { return args.join(' '); },
    history: function () { return history.map(function (h, i) { return (i + 1) + '  ' + h; }).join('\n'); },
    clear: function () { out.textContent = ''; return null; },
    theme: function () { var b = document.querySelector('.theme-toggle'); if (b) b.click(); return T('已切換。', 'Switched.'); },
    sudo: function () { return T('sean 不在 sudoers 名單中。這件事會被回報。', 'sean is not in the sudoers file. This incident will be reported.'); },
    rm: function () { return T('想得美。', 'Nice try.'); },
    meow: function () { return '=^.^='; },
    vim: function () { return T('進得去，出不來。還是算了吧。', 'You would never get out. Let us not.'); },
    exit: function () { hide(); return null; },
    unlock: function (args) {
      if (unlocked) return T('已經解鎖了。cat flag.txt', 'Already unlocked. cat flag.txt');
      if (!args[0]) return T('unlock: 需要 key。提示在某個不該被爬的地方。', 'unlock: key required. The hint lives somewhere crawlers are told not to go.');
      if (args[0].toLowerCase() !== KEY) return T('unlock: key 不對。', 'unlock: wrong key.');
      unlocked = true;
      return T('🔓 解鎖成功！cat flag.txt 看看。', '🔓 Unlocked! Try cat flag.txt.');
    }
  };

  function run(raw) {
    var line = raw.trim();
    print('$ ' + raw, 'cmd');
    if (!line) return;
    history.push(line);
    hpos = history.length;
    var parts = line.split(/\s+/);
    var name = parts[0].toLowerCase();
    if (name === 'sudo' && parts[1] === 'rm') name = 'rm';
    var fn = Object.prototype.hasOwnProperty.call(COMMANDS, name) ? COMMANDS[name] : null;
    if (!fn) { print(name + T(': 找不到指令（試試 help）', ': command not found (try help)'), 'err'); return; }
    var res = fn(parts.slice(1));
    if (res != null && res !== '') print(res);
  }

  function complete(value) {
    var parts = value.split(/\s+/);
    var pool = parts.length > 1 ? FILES.concat(['.hint']) : Object.keys(COMMANDS);
    var last = parts[parts.length - 1];
    var hits = pool.filter(function (c) { return c.indexOf(last) === 0; });
    if (hits.length === 1) { parts[parts.length - 1] = hits[0]; return parts.join(' ') + (parts.length === 1 ? ' ' : ''); }
    if (hits.length > 1) print(hits.join('  '), 'dim');
    return value;
  }

  function onKey(e) {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'Escape') { hide(); }
    else if (e.key === 'ArrowUp') { if (hpos > 0) input.value = history[--hpos]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hpos = Math.min(hpos + 1, history.length); input.value = history[hpos] || ''; e.preventDefault(); }
    else if (e.key === 'Tab') { e.preventDefault(); input.value = complete(input.value); }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.textContent = ''; }
  }

  var logo = document.querySelector('.header .logo');
  var logoLink = logo && logo.closest('a');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      show();
    });
  }
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (e.key === '`' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); show(); }
  });
})();
