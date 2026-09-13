const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const STORAGE='parasitotrilha-associacoes-v5';
const catalog=vm.createContext({});
for(const name of ['cards','curriculum','knowledge','associations','engine'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,`../../dist/${name}.js`),'utf8'),catalog);
const data=JSON.parse(vm.runInContext('JSON.stringify({cards:CARDS,board:Solitaire.create("helmintos")})',catalog));
function fixture(){
 const board=structuredClone(data.board);
 board.columns=[[{id:1,up:true}],[{id:2,up:true}],[{id:7,up:true}],[]];
 board.waste=[];board.stock=board.deckIds.filter(id=>data.cards[id].kind!=='parasite'&&![1,2,7].includes(id));
 return {version:5,deck:'helmintos',board,coins:100,attempts:0,streak:0,bestStreak:0,mastered:[],errors:[],reviewed:[],hinted:[],independent:[],history:[],feedback:null,roundId:'teste-navegador'};
}
async function study(page,tab){
 await page.locator('[data-view="study"]').click();
 if(tab)await page.locator(`[data-study-tab="${tab}"]`).click();
}
async function closeModal(page){await page.locator('#close-modal').click();await expect(page.locator('#modal')).not.toBeVisible();}
const errors=new WeakMap();
test.beforeEach(async({page})=>{
 errors.set(page,[]);page.on('pageerror',error=>errors.get(page).push(error.message));
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 await page.route('https://fonts.gstatic.com/**',route=>route.abort());
 await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(value));},{key:STORAGE,value:fixture()});
 await page.goto('/');await expect(page.locator('[data-base]')).toHaveCount(4);
 await expect(page.locator('#load-error')).toBeHidden();
});
test.afterEach(async({page})=>{expect(errors.get(page)||[]).toEqual([]);});

test('seleção, correção, desfazer e navegação preservam as regras de moedas',async({page})=>{
 await page.locator('[data-col="0"][data-index="0"]').click();
 await page.locator('[data-col="1"][data-index="0"]').click();
 await expect(page.locator('#coins')).toHaveText('100');
 await expect(page.locator('[data-col="0"]')).toHaveCount(1);
 await page.locator('[data-base="1"]').click();
 await expect(page.locator('#feedback-dialog')).toBeVisible();
 await expect(page.locator('#coins')).toHaveText('90');
 await page.locator('#continue').click();
 await page.locator('[data-col="1"][data-index="0"]').click();
 await page.locator('[data-base="0"]').click();
 await expect(page.locator('#progress-label')).toContainText('1');
 await expect(page.locator('#coins')).toHaveText('90');
 await page.locator('#undo').click();
 await page.locator('[data-col="1"][data-index="0"]').click();
 await page.locator('[data-base="0"]').click();
 await expect(page.locator('#coins')).toHaveText('90');
 await page.locator('[data-col="0"][data-index="0"]').click();
 await study(page);await page.locator('[data-view="board"]').click();
 await expect(page.locator('#cancel-selection')).toBeHidden();
 await expect(page.locator('.concept-card.selected')).toHaveCount(0);
 await page.locator('[data-base="0"]').click();
 await expect(page.locator('#modal')).toBeVisible();
 await expect(page.locator('#coins')).toHaveText('90');
});

test('arrastar no computador ou tocar no celular associa e permite reorganizar',async({page,isMobile})=>{
 const card=page.locator('[data-col="0"][data-index="0"]');
 if(isMobile){await card.tap();await page.locator('[data-target="0"]').tap();}
 else await card.dragTo(page.locator('[data-base="0"]'));
 await expect(page.locator('#coins')).toHaveText('120');
 await expect(page.locator('[data-col="0"]')).toHaveCount(0);
 if(!isMobile){
  await page.locator('[data-col="1"][data-index="0"]').dragTo(page.locator('h1'));
  await page.locator('[data-base="1"]').click();
  await expect(page.locator('#modal')).toBeVisible();await closeModal(page);
 }
 await page.locator('[data-col="1"][data-index="0"]').click();
 await page.locator('[data-column-target="3"]').click();
 await expect(page.locator('[data-col="3"][data-index="0"]')).toBeVisible();
 await expect(page.locator('#coins')).toHaveText('120');
});

test('rascunhos sobrevivem à aba fechada e o backup reúne todos os dados sem substituir a mesa',async({page,context})=>{
 await page.locator('[data-col="0"][data-index="0"]').click();await page.locator('[data-base="0"]').click();
 await page.locator('[data-view="library"]').click();await page.locator('[data-favorite="1"]').click();
 await study(page);await page.locator('#configure-review').click();await page.locator('#session-size').selectOption('5');await page.locator('#begin-session').click();
 const notes='O ovo atravessa <barreiras> & a larva migra. "Meu rascunho"';
 await page.locator('#recall-notes').fill(notes);await closeModal(page);
 await page.locator('#practice-cycle').click();await page.locator('[data-cycle-step="0"]').click();await closeModal(page);
 const reopened=await context.newPage();await page.close();page=reopened;
 await page.goto('/#study/atlas/0');await page.locator('#resume-exercise').click();
 await expect(page.locator('[data-resume-draft]')).toHaveCount(2);
 await page.locator('[data-resume-draft]').filter({hasText:'Memória'}).click();
 await expect(page.locator('#recall-notes')).toHaveValue(notes);
 await closeModal(page);await study(page,'progress');
 const downloadEvent=page.waitForEvent('download');await page.locator('#export-progress').click();
 const download=await downloadEvent,backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
 expect(backup.format).toBe('parasitotrilha-backup-v3');expect(backup.rounds[0].coins).toBe(120);
 expect(backup.favorites).toHaveLength(1);expect(backup.drafts.filter(d=>!d.complete)).toHaveLength(2);
 await page.evaluate(()=>localStorage.clear());await page.reload();await study(page,'progress');
 const current=await page.evaluate(key=>localStorage.getItem(key),STORAGE);
 const file={name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))};
 await page.locator('#import-progress').setInputFiles(file);
 await expect(page.locator('#backup-result')).toContainText('1 partidas, 2 exercícios e 1 favoritos');
 expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE)).toBe(current);
 await page.locator('#import-progress').setInputFiles(file);
 await expect(page.locator('#backup-result')).toContainText('0 partidas, 0 exercícios e 0 favoritos');
 const stored=await page.evaluate(()=>JSON.stringify({...localStorage}));
 const invalid={...backup,favorites:['__proto__']};
 await page.locator('#import-progress').setInputFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
 await expect(page.locator('#backup-result')).toContainText('favoritos inválidos');
 expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).toBe(stored);
 await page.locator('#saved-rounds').click();await page.locator('[data-resume-round]').filter({hasText:'120 moedas'}).click();
 await expect(page.locator('#coins')).toHaveText('120');
 await study(page);await page.locator('#resume-exercise').click();
 await page.locator('[data-resume-draft]').filter({hasText:'Memória'}).click();
 await expect(page.locator('#recall-notes')).toHaveValue(notes);await page.locator('#reveal-recall').click();
 await expect(page.locator('[data-grade="good"]')).toBeDisabled();
 for(const checkbox of await page.locator('[data-rubric]').all())await checkbox.check();
 await page.locator('[data-grade="good"]').click();await expect(page.locator('#modal-title')).toHaveText('Memória · 2 de 5');
});

test('caso aceita diagnóstico compartilhado sem revelar a espécie na carta preenchida',async({page})=>{
 await study(page,'cases');await page.locator('[data-case="4"]').click();
 const ids=[data.cards.find(c=>c.family===15&&c.kind==='parasite').id,data.cards.find(c=>c.family===15&&['egg','stage'].includes(c.kind)).id,52];
 for(let slot=0;slot<3;slot++){
  const card=page.locator(`[data-case-card="${ids[slot]}"]`),title=await card.locator('b').innerText();
  await card.click();await page.locator(`[data-case-slot="${slot}"]`).click();
  await expect(page.locator(`[data-case-slot="${slot}"] strong`)).toHaveText(title);
 }
 await page.locator('#verify-case').click();
 await expect(page.locator('#case-result')).toContainText('As três cartas se conectam.');
 await expect(page.locator('#case-result')).toContainText('também é válida');
 await expect(page.locator('#coins')).toHaveText('100');
});

test('navegação por teclado, rotas e largura da interface',async({page})=>{
 await study(page);await page.locator('[data-study-tab="atlas"]').focus();await page.keyboard.press('ArrowRight');
 await expect(page.locator('[data-study-tab="compare"]')).toBeFocused();
 await expect(page).toHaveURL(/#study\/compare\/0$/);
 for(const route of ['/#board','/#library','/#study/compare/0','/#study/progress/0','/#study/cases/0']){
  await page.goto(route);
  const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
  expect(size.content).toBeLessThanOrEqual(size.width+1);
 }
 await page.locator('[data-case="0"]').click();
 const modal=await page.locator('#modal').boundingBox(),viewport=page.viewportSize();
 expect(modal.x).toBeGreaterThanOrEqual(0);expect(modal.x+modal.width).toBeLessThanOrEqual(viewport.width+1);
 await page.keyboard.press('Escape');await expect(page.locator('#modal')).not.toBeVisible();
});
