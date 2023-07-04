let $ = (...args) => {
  let p = typeof args[0] !== 'string' ? args.shift() : document;
  return p.querySelector(args[0]);
};

let $$ = (...args) => {
  let p = typeof args[0] !== 'string' ? args.shift() : document;
  return p.querySelectorAll(args[0]);
};

let windy = (...args) => {
  let name = args.length > 1 && args.shift();
  let styles = args.shift() || '';
  let id = name ? `windy--${name}` : 'windy';
  let s = $(`#${id}`);

  if (!s) {
    s = document.createElement('style');
    s.id = id;

    if (name) {
      let su = $('#windy');
      su && s.insertAdjacentElement('afterend', su);
    } else {
      document.head.append(s);
    }
  }

  if (name) {
    s.textContent = buildRuleSet(name, styles);
    windy.semantic[name] = styles.replace(/\s+/g, ' ').trim();
    return name;
  }

  for (let x of styles.trim().split(/\s+/)) {
    if (windy.util.has(x)) { continue }
    s.textContent += buildRuleSet(x, x) + '\n';
    windy.util.add(x);
  }

  return styles;
};

windy.semantic = {};
windy.util = new Set();

windy.builders = [
  [/^italic$/, () => ({ 'font-style': 'italic' })],
];

function buildRuleSet(sel, styles) {
  let semantic = sel !== styles, sets = {};

  for (let x of styles.trim().split(/\s+/)) {
    let xs = x.split(':'), y = xs.pop();
    let z = xs.join(':') || 'base';
    (sets[z] ??= []).push(y);
  }

  return Object.keys(sets).map(x => {
    let xs = x.split(':');
    return buildRule(xs, semantic, sel, sets[x].join(' '));
  }).join('\n\n');
}

function buildRule(mods, semantic, sel, styles) {
  let { bp, bpid, sts } = parseMods(mods), rule = [];

  if (bp) {
    rule.push(`@media (min-width: ${bp}) {`);
  }

  rule.push(`${buildSelector(sts, semantic, sel)} {`);
  rule.push(...buildPropertyLines(styles));
  rule.push('}');

  if (bp) { rule.push('}') }

  console.log(rule.join('\n'));
  return rule.join('\n');
}

function buildSelector(sts, semantic, sel) {
  return `.${sel}`;
}

function buildPropertyLines(styles) {
  let props = {};

  for (let x of styles.trim().split(/\s+/)) {
    for (let b of windy.builders) {
      let m = b[0].exec(x);
      if (!m) { continue }
      Object.assign(props, b[1](...[].slice.call(m, 1)));
    }
  }

  return Object.entries(props).map(x => `${x[0]}: ${x[1]};`);
}

function parseMods(xs) {
  let bp = null, bpid = null, sts = [];

  for (let x of xs) {
    if (parseMods.breakpoints[x]) {
      bpid = x;
      bp = parseMods.breakpoints[x];
      continue;
    }

    if (parseMods.specialStates[x]) {
      sts.push([x, parseMods.specialStates[x]]);
      continue;
    }

    sts.push([x, x]);
  }

  return { bp, bpid, sts };
}

parseMods.breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

parseMods.specialStates = {
  'group-hover': 'hover',
};

windy('MyComponent', 'font-semibold md:hover:italic');

export default windy;
