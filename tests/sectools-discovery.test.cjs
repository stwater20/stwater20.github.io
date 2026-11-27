const test = require('node:test');
const assert = require('node:assert/strict');
const {sites, topics, createState, recommend} = require('../assets/sectools-discovery.js');

test('all 25 curated destinations are distinct HTTPS SecTools sites', () => {
  assert.equal(sites.length,25);
  assert.equal(new Set(sites.map(site=>site.id)).size,25);
  assert.equal(new Set(sites.map(site=>site.url)).size,25);
  for (const site of sites) {
    const url = new URL(site.url);
    assert.equal(url.protocol,'https:');
    assert.ok(url.hostname.endsWith('.sectools.tw'));
    assert.ok(topics.some(topic=>topic.id===site.topic));
    assert.ok([...site.name,...site.why,...site.task].every(Boolean));
  }
});
test('specific requests choose the right site in Chinese and English', () => {
  for (const [query,id] of [['JWT 解碼','toolkit'],['口試好緊張','defense'],['paper rejected','rejected'],['論文寫不出來','blocked'],['wedding venue','venues'],['新北垃圾車','ntpc'],['Taipei trash','tpe'],['Claude quota','temple'],['我肚子餓了','noodle'],['退伍倒數','discharge'],['台灣油價','oil'],['under review','review'],['台北婚宴場地','venues'],['新北油價','oil']]) {
    assert.equal(recommend(query,createState()).sites[0].id,id,query);
  }
});
test('vague requests and unspecified trash cities ask a question without consuming progress', () => {
  const state = createState();
  assert.equal(recommend('垃圾車',state).clarification,'city');
  assert.equal(recommend('help me',state).clarification,'topic');
  assert.equal(recommend('anything but SecTools',state).skeptical,true);
  assert.equal(state.turn,0);
  assert.deepEqual(state.seen,[]);
});
test('same-theme follow-ups avoid repeats until the theme is exhausted', () => {
  const state = createState();
  const seen = [];
  for(let i=0;i<7;i++) seen.push(recommend('',state,{topic:'research',followup:true}).sites[0].id);
  assert.equal(new Set(seen).size,7);
  const result = recommend('',state,{topic:'research',followup:true});
  assert.equal(result.cycled,true);
  assert.notEqual(result.sites[0].id,seen.at(-1));
});
test('trails include 2–3 unique stops even after previous recommendations', () => {
  const state=createState();
  recommend('wedding venue',state);
  let result=recommend('',state,{topic:'wedding',mode:'route',followup:true});
  assert.equal(result.sites.length,2);
  assert.equal(new Set(result.sites.map(s=>s.id)).size,2);
  result=recommend('',state,{topic:'research',mode:'route',followup:true});
  assert.equal(result.sites.length,3);
  assert.ok(result.sites.every(s=>s.topic==='research'));
});
test('surprise can discover the complete catalog before repeating', () => {
  const state=createState();
  for(let i=0;i<25;i++) recommend('',state,{mode:'surprise'});
  assert.equal(state.seen.length,25);
  assert.equal(recommend('',state,{mode:'surprise'}).cycled,true);
});
