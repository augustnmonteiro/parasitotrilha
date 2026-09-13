const Solitaire = (() => {
  const shuffle = values => {
    const a = [...values];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const anchor = family => CARDS.find(c => c.family === family && c.kind === 'parasite').id;
  function create(deckName = 'helmintos') {
    const config = DECKS[deckName] || DECKS.helmintos;
    const families = config.families ? [...config.families] : shuffle(FAMILIES.map((_, i) => i)).slice(0, 4);
    const deckIds = CARDS.filter(c => families.includes(c.family)).map(c => c.id);
    const deck = shuffle(deckIds.filter(id => CARDS[id].kind !== 'parasite'));
    return {
      families, deckIds,
      columns: Array.from({length: 4}, () => Array.from({length: 3}, (_, n) => ({id: deck.pop(), up: n === 2}))),
      stock: deck, waste: [], foundations: families.map(f => [anchor(f)])
    };
  }
  function stack(b, from) {
    if (!from) return [];
    if (from.zone === 'waste') return b.waste.length ? [b.waste.at(-1)] : [];
    if (from.zone !== 'column' || !Number.isInteger(from.col) || from.col < 0 || from.col >= 4 || !Number.isInteger(from.index)) return [];
    const col = b.columns[from.col];
    if (from.index < 0 || from.index >= col.length || !col[from.index].up) return [];
    const part = col.slice(from.index);
    if (part.some(x => !x.up || CARDS[x.id].family !== CARDS[part[0].id].family)) return [];
    return part.map(x => x.id);
  }
  function targetFamily(b, to) {
    if (to?.zone === 'foundation' && Number.isInteger(to.pile) && to.pile >= 0 && to.pile < 4) return b.families[to.pile];
    if (to?.zone === 'column' && Number.isInteger(to.col) && to.col >= 0 && to.col < 4) {
      const top = b.columns[to.col].at(-1);
      return top ? CARDS[top.id].family : null;
    }
    return undefined;
  }
  function structural(b, from, to) {
    return stack(b, from).length > 0 && targetFamily(b, to) !== undefined && !(from.zone === 'column' && to.zone === 'column' && from.col === to.col);
  }
  function canMove(b, from, to) {
    if (!structural(b, from, to)) return false;
    const family = targetFamily(b, to);
    return family === null || stack(b, from).every(id => CARDS[id].family === family);
  }
  function move(b, from, to) {
    if (!canMove(b, from, to)) return false;
    const ids = stack(b, from);
    if (from.zone === 'waste') b.waste.pop();
    else {
      b.columns[from.col].splice(from.index);
      const top = b.columns[from.col].at(-1);
      if (top) top.up = true;
    }
    if (to.zone === 'foundation') b.foundations[to.pile].push(...ids);
    else b.columns[to.col].push(...ids.map(id => ({id, up: true})));
    return true;
  }
  function draw(b) {
    if (b.stock.length) { b.waste.push(b.stock.pop()); return true; }
    if (b.waste.length) { b.stock = [...b.waste].reverse(); b.waste = []; return true; }
    return false;
  }
  function valid(b) {
    if (!b || !Array.isArray(b.families) || b.families.length !== 4 || new Set(b.families).size !== 4 || b.families.some(f => !Number.isInteger(f) || !FAMILIES[f])) return false;
    if (!Array.isArray(b.deckIds) || b.deckIds.length < 8 || new Set(b.deckIds).size !== b.deckIds.length || b.deckIds.some(id => !Number.isInteger(id) || !CARDS[id] || !b.families.includes(CARDS[id].family))) return false;
    if (!Array.isArray(b.columns) || b.columns.length !== 4 || !Array.isArray(b.stock) || !Array.isArray(b.waste) || !Array.isArray(b.foundations) || b.foundations.length !== 4) return false;
    const ids = [];
    for (const col of b.columns) {
      if (!Array.isArray(col)) return false;
      let up = false, family = null;
      for (const c of col) {
        if (!c || typeof c.up !== 'boolean' || !CARDS[c.id] || up && !c.up || CARDS[c.id].kind === 'parasite') return false;
        if (c.up && family !== null && family !== CARDS[c.id].family) return false;
        if (c.up) family = CARDS[c.id].family;
        up = up || c.up; ids.push(c.id);
      }
      if (col.length && !col.at(-1).up) return false;
    }
    for (let p = 0; p < 4; p++) {
      const pile = b.foundations[p], f = b.families[p];
      if (!Array.isArray(pile) || !pile.length || pile[0] !== anchor(f) || pile.some(id => !CARDS[id] || CARDS[id].family !== f)) return false;
      ids.push(...pile);
    }
    if ([...b.stock, ...b.waste].some(id => !CARDS[id] || CARDS[id].kind === 'parasite')) return false;
    ids.push(...b.stock, ...b.waste);
    return ids.length === b.deckIds.length && new Set(ids).size === ids.length && ids.every(id => b.deckIds.includes(id));
  }
  return {create, shuffle, anchor, stack, targetFamily, structural, canMove, move, draw, valid};
})();
