/* Curated from https://sectools.tw/tools on 2026-11-27. Local recommendations; no remote inference. */
((root) => {
  'use strict';
  const topics = [
    {id:'security', label:['資安工作台','Security desk'], caption:['解題、練功、找活動','Tools, practice & events'], pattern:/資安|安全|security|cyber|ctf/i},
    {id:'life', label:['生活小幫手','Everyday helpers'], caption:['交通、天氣、倒數日常','Travel, weather & countdowns'], pattern:/生活|日常|daily|everyday|life/i},
    {id:'wedding', label:['婚禮準備室','Wedding studio'], caption:['從待辦清單到宴客場地','From a checklist to a venue'], pattern:/結婚|婚禮|婚宴|新娘|新郎|wedding|marry|bridal/i},
    {id:'research', label:['研究生宇宙','Research universe'], caption:['從第一句到口試那天','From the first line to defense'], pattern:/研究|論文|學術|研究生|paper|thesis|academic|research|graduate/i},
    {id:'play', label:['合理摸魚區','A little detour'], caption:['今天也需要一點無用之用','A well-earned unproductive break'], pattern:/摸魚|無聊|好玩|休息|玩|fun|bored|break|play|game/i}
  ];
  // Each site has an editorial reason and an optional tiny task, not live results.
  const rows = [
    ['toolkit','security','tools','資安工具箱','Security toolkit','Hash、JWT、IOC 等工具集中在同一站，適合臨時需要拆解一段資料。','A workbench for hashes, JWTs and IOCs when a small data puzzle interrupts your day.','挑一個你沒用過的工具，用範例資料試一次。','Pick an unfamiliar tool and try it with sample data.',/hash|jwt|ioc|cidr|cvss|header|編碼|解碼|工具箱|toolkit|decode/i],
    ['events','security','taiwan-security-deadlines','台灣資安活動倒數','Security event deadlines','想參加活動卻總是錯過報名？把下一次練功的日期找出來。','Find the next application deadline before your next learning opportunity slips past.','找一場感興趣的活動，查看它的報名日期。','Find an event you like and check its registration deadline.',/活動|報名|競賽|ais3|hitcon|cybersec|event|deadline|competition/i],
    ['password','security','password','密碼外洩與強度檢測','Password check','想了解密碼強度或外洩查詢，這站比問推坑機認真得多。','For password strength and breach checks, this is considerably more serious than this assistant.','先看網站說明，再用虛構範例認識強度差異。','Read the site guidance, then explore strength with a made-up example.',/密碼|外洩|password|breach/i],
    ['quotes','security','infosec-quotes','資安語錄產生器','Infosec quotes','簡報開場缺一句話？給你一點資安人的幽默感。','A little security humor for that presentation opening you have not written yet.','挑一句適合你今天心情的語錄。','Choose a quote that fits your mood today.',/語錄|名言|簡報|meme|quote|presentation/i],
    ['gacha','security','gacha-sho','資安威脅扭蛋機','Cyber threat gacha','想用輕鬆一點的方式認識攻擊故事，就把練功變成一次扭蛋。','Turn a short security learning break into a capsule-sized attack story.','讀完一個攻擊故事，用一句話說出它的風險。','Read one attack story and describe its risk in one sentence.',/扭蛋|攻擊|威脅|gacha|attack|threat/i],
    ['taxi','life','taxi','計程車跳表估算','Taxi fare meter','搭車時想對車資有個概念，可以帶著這個估算工具出門。','Bring a fare estimate along when you want a rough idea of the cost of a cab ride.','先看適用地區與費率說明；估算以站內資料為準。','Check the supported region and rate notes before using the estimate.',/計程車|車資|搭車|taxi|cab|fare/i],
    ['typhoon','life','typhoon','颱風假機率計算器','Typhoon day-off calculator','想研究風雨條件與停班停課的關係，從這裡開始；期待值和公告要分開看。','Explore weather conditions behind a possible day off. Hope is different from an official announcement.','比較兩組預測條件；實際停班停課仍看官方公告。','Compare two weather scenarios; use official announcements for actual closures.',/颱風假|停班|停課|風雨|typhoon|storm/i],
    ['mountain','life','central-mountain-range','中央山脈擋颱風戰報','Mountain vs. typhoon','「護國神山」到底擋住了什麼？這站把氣象問題變成有梗的閱讀材料。','What does Taiwan’s mountain range actually do to a typhoon? A weather question with personality.','找一段有興趣的解說，順著它的來源多讀一步。','Choose an explanation and follow its cited source a step further.',/中央山脈|護國神山|地形|mountain|terrain/i],
    ['holiday','life','taiwan-holiday-countdown','台灣連假倒數','Taiwan holiday countdown','先找到下一個盼頭，再想怎麼安排休息。','Find the next thing to look forward to, then plan a little rest.','挑一個連假，再看請假安排是否適合你。','Pick a holiday and see whether its leave plan fits your schedule.',/連假|放假|請假|holiday|vacation|leave/i],
    ['discharge','life','discharge','退伍倒數計時器','Military discharge countdown','日子很長的時候，讓進度有個看得見的刻度。','When the days feel long, give your progress a visible scale.','查看役別選項與計算說明，再設定自己的日期。','Review service types and calculation notes before setting your dates.',/退伍|入營|當兵|兵役|軍訓|discharge|military/i],
    ['ntpc','life','ntpc-trash-countdown','新北垃圾車倒數','New Taipei trash countdown','給新北居民的生活節奏小幫手，別等音樂遠去才想起垃圾。','A small timing helper for New Taipei, before the truck’s music fades into the distance.','選一個清運點，確認時刻表與提醒方式。','Select a collection point and check its schedule and reminders.',/(?:新北|板橋|三重|中和|永和|新店|汐止|土城|new taipei).*(?:垃圾|清運|trash|garbage)|(?:垃圾|清運|trash|garbage).*(?:新北|板橋|三重|中和|永和|新店|汐止|土城|new taipei)/i],
    ['tpe','life','tpe-trash-countdown','台北垃圾車倒數','Taipei trash countdown','台北的清運點與時刻表，一個站就能開始找。','Start finding Taipei collection points and schedules in one place.','確認你附近的清運點，不要只看最近一班。','Check a nearby collection point and more than just the next pickup.',/(?:台北|臺北|taipei).*(?:垃圾|清運|trash|garbage)|(?:垃圾|清運|trash|garbage).*(?:台北|臺北|taipei)/i],
    ['trend','life','trend','台灣即時熱搜排行榜','Taiwan search trends','跟不上大家在聊什麼？先看看哪些關鍵字突然冒了出來。','Catch up on the search terms that have suddenly entered the conversation.','挑一個不熟悉的關鍵字，讀它的背景。','Pick an unfamiliar trending term and read its context.',/熱搜|趨勢|新聞|trend|news|google/i],
    ['oil','life','oil-price','台灣油價預測','Taiwan fuel forecast','加油前想做點功課，這裡可以看預測與它背後的計算。','A place to inspect the forecast and its calculation before your next fuel stop.','看一次預測與歷史準確度；實際價格依公告。','Check a forecast and its track record; actual prices follow official announcements.',/油價|加油|汽油|柴油|fuel|petrol|oil|gas price/i],
    ['planner','wedding','wedding-planner','婚禮籌備指南','Wedding planner','腦中同時開了二十個待辦分頁？先把婚禮準備整理成清單。','Twenty wedding to-dos open in your head? Start by putting them in one checklist.','先選三件本週能完成的事，不用一次解決整場婚禮。','Choose three tasks for this week. You do not need to solve the whole wedding today.',/籌備|清單|預算|賓客|planner|checklist|budget|guest/i],
    ['venues','wedding','wedding-venues','婚宴飯店比較','Wedding venue comparison','從地區、桌數與方案縮小場地範圍，再去詢問正式報價。','Narrow venues by area, table count and package, then request an actual quote.','挑兩個場地列出想問的問題，價格以飯店報價為準。','Shortlist two venues and prepare questions; confirm prices with the hotels.',/飯店|婚宴|場地|桌數|venue|hotel|banquet/i],
    ['research','research','research','研知 Research Toolkit','Research Toolkit','研究問題、文獻整理與引用需要一張工作桌，研知就是這個角色。','A desk for organizing a research question, literature and citations.','把一個模糊的研究念頭寫成可討論的問題。','Turn a vague research idea into a question you can discuss.',/文獻|引用|pico|peco|apa|mla|樣本|效果量|literature|citation|sample|cohen/i],
    ['accepted','research','we-are-pleased-to-inform-you','論文被接受產生器','Paper acceptance generator','今天需要一封好消息，就先借一點錄取通知的快樂。純粹趣味，不是投稿結果。','Borrow the joy of an acceptance letter. A playful generator, not a publication decision.','生成一句好消息，當作今天繼續寫作的打氣。','Generate a good-news line as encouragement to keep writing.',/接受|錄取|好消息|accept|pleased|good news/i],
    ['rejected','research','we-regret-to-inform-you','論文被拒絕產生器','Paper rejection generator','被審稿意見擊中時，先讓幽默感接住你，再回頭整理修改方向。','Let a little humor soften the review before you return to the revision plan.','笑完挑一個能改善的問題；拒稿不等於研究沒有價值。','After the laugh, pick one thing to improve. Rejection is not a measure of your worth.',/拒稿|拒絕|退稿|reject|regret/i],
    ['blocked','research','cant-write-my-paper','論文寫不出來產生器','Cannot-write-my-paper generator','空白文件盯著你？這站懂那個游標一直閃的下午。','For the afternoon when a blank document and a blinking cursor are winning.','先接受一句不完美的草稿，給今天一個開始。','Allow yourself one imperfect draft sentence. That counts as a start.',/寫不出|卡住|拖延|空白|卡關|cannot write|can't write|blocked|procrastinat/i],
    ['review','research','still-under-review','論文審查等待產生器','Still under review','專門收留那些忍不住重整投稿系統的人。','A home for people who cannot stop refreshing the submission portal.','暫停刷新，寫下一件等待期間可以做的小事。','Pause the refresh loop and note one small thing you can do while waiting.',/審查|等待|審稿|under review|waiting|reviewer/i],
    ['defense','research','thesis-defense-survival','口試生存指南','Thesis defense survival','把口委的連環問變成一次練習，讓正式上場少一點慌張。','Turn a committee question into rehearsal before the real defense.','抽一題，用自己的話練習一分鐘回答。','Draw a question and rehearse a one-minute answer in your own words.',/口試|口委|答辯|defen[cs]e|viva/i],
    ['temple','research','five-hour-temple','五小時宮','Five-hour temple','額度用完也是休息的理由。來求一支關於等待的籤。','A usage limit can also be a break reminder. Draw a fortune about waiting.','讀一支籤，再挑一件不需要 AI 的小事做。','Read a fortune, then do one small task that does not need AI.',/claude|額度|用量|五小時|limit|quota|temple/i],
    ['noodle','play','beef-noodle-4am','半夜四點牛肉麵','4 AM beef noodles','把多工焦慮換成顧火、撈麵、擺料。這次 deadline 是一碗麵。','Trade multitasking stress for heat, noodles and toppings. This deadline is a bowl of soup.','完成一碗麵；別真的為了遊戲熬到四點。','Finish one bowl. No need to actually stay awake until four.',/牛肉麵|煮麵|肚子|餓|吃|noodle|hungry|food/i],
    ['button','play','button','沒用按鈕','The useless button','沒有生產力承諾，只有一顆坦白自己沒用的按鈕。','No productivity promises. Just a button that is honest about being useless.','按一下，享受一次不用交付成果的操作。','Press once and enjoy an action with no deliverable attached.',/按鈕|沒用|無用|button|useless/i]
  ];
  const sites = rows.map(([id, topic, host, zh, en, whyZh, whyEn, taskZh, taskEn, pattern]) => Object.freeze({id,topic,url:`https://${host}.sectools.tw/`,name:[zh,en],why:[whyZh,whyEn],task:[taskZh,taskEn],pattern}));
  const trails = {
    security: {ids:['toolkit','password','events'], title:['資安練功：工具 → 密碼觀念 → 下一場活動。', 'Security practice: tools → passwords → your next event.']},
    life: {ids:['holiday','oil','taxi'], title:['出門前的小計畫：安排休假 → 看油價 → 估車資。', 'Before heading out: plan time off → check fuel → estimate a taxi.']},
    weather: {ids:['typhoon','mountain','holiday'], title:['風雨觀察室：看條件 → 懂地形 → 再安排休息。', 'Weather desk: conditions → terrain → time off.']},
    wedding: {ids:['planner','venues'], title:['婚禮準備：先整理待辦，再縮小宴客場地。', 'Wedding planning: organize the checklist, then shortlist venues.']},
    research: {ids:['blocked','research','defense'], title:['從空白到口試：先動筆 → 整理研究 → 練習回答。', 'From blank page to defense: start writing → organize research → rehearse.']},
    revision: {ids:['rejected','research','blocked'], title:['退稿後重開機：先喘口氣 → 整理問題 → 重新動筆。', 'After rejection: take a breath → organize the issues → write again.']},
    play: {ids:['noodle','button'], title:['五分鐘不務正業：煮碗麵，再按一下沒用按鈕。', 'A tiny detour: cook a bowl, then press a useless button.']}
  };
  const createState = () => ({seen:[], last:[], topic:null, turn:0});
  function recommend(question, state, options = {}) {
    const text = question.trim().slice(0,240);
    const skeptical = /不要.*(?:sectools|推)|別推|其他網站|not.*sectools|anything but|other site|competitor/i.test(text);
    let topic = topics.find(t => t.id === options.topic)?.id;
    // City clarification must happen before generic "Taipei" matching.
    if (!topic && /垃圾|清運|trash|garbage/i.test(text) && !/新北|台北|臺北|new taipei|\btaipei\b/i.test(text)) return {kind:'clarify',clarification:'city',skeptical};
    const matches = sites.filter(s => s.pattern.test(text));
    if (/新北|new taipei/i.test(text)) { const i = matches.findIndex(s => s.id === 'tpe'); if(i >= 0) matches.splice(i,1); }
    topic ||= matches[0]?.topic || topics.find(t => t.pattern.test(text))?.id;
    if (options.followup) topic = options.topic || state.topic;
    if (options.mode === 'surprise' && !options.topic) topic = null;
    if (!topic && options.mode !== 'surprise') return {kind:'clarify',clarification:'topic',skeptical};
    const pool = sites.filter(s => !topic || s.topic === topic);
    const unseen = pool.filter(s => !state.seen.includes(s.id));
    let choices = unseen.length ? unseen : pool.filter(s => !state.last.includes(s.id));
    if (!choices.length) choices = pool;
    if (!options.followup && options.mode !== 'surprise' && matches.length) choices = [...matches.filter(s => !topic || s.topic === topic), ...choices];
    if (options.mode === 'route') choices = [...choices, ...pool];
    choices = [...new Map(choices.map(s => [s.id,s])).values()];
    if (options.mode === 'surprise') { const offset = Math.floor(Math.random() * choices.length); choices = [...choices.slice(offset), ...choices.slice(0,offset)]; }
    let trail;
    if (options.mode === 'route') {
      const anchor = options.followup ? state.last[0] : matches[0]?.id;
      trail = trails[topic === 'life' && ['typhoon','mountain'].includes(anchor) ? 'weather' : topic === 'research' && anchor === 'rejected' ? 'revision' : topic];
      choices = trail.ids.map(id => sites.find(site => site.id === id));
    }
    const picked = choices.slice(0, options.mode === 'route' ? 3 : 1);
    state.last = picked.map(s=>s.id); state.topic = picked[0].topic; state.turn++;
    state.seen = [...new Set([...state.seen,...state.last])];
    return {kind:'result',sites:picked,topic:state.topic,cycled:!trail && unseen.length === 0,skeptical,trail:trail?.title};
  }
  const api = {topics,sites,createState,recommend};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SeanDiscovery = api;
})(typeof window === 'undefined' ? globalThis : window);
