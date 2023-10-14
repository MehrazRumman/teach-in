'use strict';
Object.defineProperty(exports, '__esModule', { value: true });

const PRE_CONVERSION_MAP: { [key: string]: string } = {
  ' +': ' ',
  yy: 'y',
  vv: 'v',
  '„„': '„',
  '­­': '­',
  'y&': 'y',
  '„&': '„',
  '‡u': 'u‡',
  wu: 'uw',
  ' ,': ',',
  ' \\|': '\\|',
  '\\\\: ': ' ',
  ' \\\\\\ ': '',
  '\\\\\\': '',
  '\n +': '\n',
  ' +\n': '\n',
  '\n\n\n\n\n': '\n\n',
  '\n\n\n\n': '\n\n',
  '\n\n\n': '\n\n',
  '&nbsp;': '\n',
};

const CONVERSION_MAP: { [key: string]: string } = {
  '°': 'ক্ক',
  '±': 'ক্ট',
  '²': 'ক্ষ্ণ',
  '³': 'ক্ত',
  '´': 'ক্ম',
  µ: 'ক্র',
  '¶': 'ক্ষ',
  '·': 'ক্স',
  '¸': 'গু',
  '¹': 'জ্ঞ',
  º: 'গ্দ',
  '»': 'গ্ধ',
  '¼': 'ঙ্ক',
  '½': 'ঙ্গ',
  '¾': 'জ্জ',
  '¿': '্ত্র',
  À: 'জ্ঝ',
  Á: 'জ্ঞ',
  Â: 'ঞ্চ',
  Ã: 'ঞ্ছ',
  Ä: 'ঞ্জ',
  Å: 'ঞ্ঝ',
  Æ: 'ট্ট',
  Ç: 'ড্ড',
  È: 'ণ্ট',
  É: 'ণ্ঠ',
  Ê: 'ণ্ড',
  Ë: 'ত্ত',
  Ì: 'ত্থ',
  Î: 'ত্র',
  Ï: 'দ্দ',
  Ð: 'ণ্ড',
  Ñ: '-',
  Ò: '"',
  Ó: '"',
  Ô: "'",
  Õ: "'",
  '×': 'দ্ধ',
  Ø: 'দ্ব',
  Ù: 'দ্ম',
  Ú: 'ন্ঠ',
  Û: 'ন্ড',
  Ü: 'ন্ধ',
  Ý: 'ন্স',
  Þ: 'প্ট',
  ß: 'প্ত',
  à: 'প্প',
  á: 'প্স',
  â: 'ব্জ',
  ã: 'ব্দ',
  ä: 'ব্ধ',
  å: 'ভ্র',
  ç: 'ম্ফ',
  é: 'ল্ক',
  ê: 'ল্গ',
  ë: 'ল্ট',
  ì: 'ল্ড',
  í: 'ল্প',
  î: 'ল্ফ',
  ï: 'শু',
  ð: 'শ্চ',
  ñ: 'শ্ছ',
  ò: 'ষ্ণ',
  ó: 'ষ্ট',
  ô: 'ষ্ঠ',
  õ: 'ষ্ফ',
  ö: 'স্খ',
  '÷': 'স্ট',
  ø: 'স্ন',
  ù: 'স্ফ',
  û: 'হু',
  ü: 'হৃ',
  ý: 'হ্ন',
  ÿ: 'ক্ষ',
  þ: 'হ্ম',
  A: 'অ',
  B: 'ই',
  C: 'ঈ',
  D: 'উ',
  E: 'ঊ',
  F: 'ঋ',
  G: 'এ',
  H: 'ঐ',
  I: 'ও',
  J: 'ঔ',
  K: 'ক',
  L: 'খ',
  M: 'গ',
  N: 'ঘ',
  O: 'ঙ',
  P: 'চ',
  Q: 'ছ',
  R: 'জ',
  S: 'ঝ',
  T: 'ঞ',
  U: 'ট',
  V: 'ঠ',
  W: 'ড',
  X: 'ঢ',
  Y: 'ণ',
  Z: 'ত',
  _: 'থ',
  '`': 'দ',
  a: 'ধ',
  b: 'ন',
  c: 'প',
  d: 'ফ',
  e: 'ব',
  f: 'ভ',
  g: 'ম',
  h: 'য',
  i: 'র',
  j: 'ল',
  k: 'শ',
  l: 'ষ',
  m: 'স',
  n: 'হ',
  o: 'ড়',
  p: 'ঢ়',
  q: 'য়',
  r: 'ৎ',
  s: 'ং',
  t: 'ঃ',
  u: 'ঁ',
  '•': 'ঙ্',
  '|': '।',
};

const PRE_SYMBOLS_MAP: { [key: string]: string } = {
  '®': 'ষ্',
  '¯': 'স্',
  '”': 'চ্',
  '˜': 'দ্',
  '™': 'দ্',
  š: 'ন্',
  '›': 'ন্',
  '¤': 'ম্',
};

const REFF: { [key: string]: string } = {
  '©': 'র্',
};

const POST_SYMBOLS_MAP: { [key: string]: string } = {
  '&': '্‌',
  ú: '্প',
  è: '্ন',
  '^': '্ব',
  '‘': '্তু',
  '’': '্থ',
  '‹': '্ক',
  Œ: '্ক্র',
  '—': '্ত',
  Í: '্ত',
  œ: '্ন',
  Ÿ: '্ব',
  '¡': '্ব',
  '¢': '্ভ',
  '£': '্ভ্র',
  '¥': '্ম',
  '¦': '্ব',
  '§': '্ম',
  '¨': '্য',
  ª: '্র',
  '«': '্র',
  '¬': '্ল',
  '­': '্ল',
  Ö: '্র',
};

const KAARS: { [key: string]: string } = {
  v: 'া',
  w: 'ি',
  x: 'ী',
  y: 'ু',
  z: 'ু',
  æ: 'ু',
  '“': 'ু',
  '–': 'ু',
  '~': 'ূ',
  ƒ: 'ূ',
  '‚': 'ূ',
  '„': 'ৃ',
  '…': 'ৃ',
  '†': 'ে',
  '‡': 'ে',
  ˆ: 'ৈ',
  '‰': 'ৈ',
  Š: 'ৗ',
};

const KAAR_POST_CONVERSION: { [key: string]: string } = {
  'ো': 'ো',
  'ৌ': 'ৌ',
};

const POST_CONVERSION_MAP: { [key: string]: string } = {
  অা: 'আ',
  '্‌্‌': '্‌',
};

const ALL_SYMBOLS = {
  ...CONVERSION_MAP,
  ...PRE_SYMBOLS_MAP,
  ...POST_SYMBOLS_MAP,
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createConversionPattern(
  symbols: { [key: string]: string },
  delimiter = '',
) {
  return Object.keys(symbols)
    .map((val) => escapeRegExp(val))
    .join(delimiter);
}

const SYMBOLS_CONVERSION_PATTERN = new RegExp(
  '([' + createConversionPattern(ALL_SYMBOLS, '') + '])',
  'g',
);

const MAIN_CONVERSION_PATTERN = new RegExp(
  '([w\u2020\u2021\u02C6\u2030\u0160]?)(([' +
    createConversionPattern(PRE_SYMBOLS_MAP) +
    '])*([' +
    createConversionPattern(CONVERSION_MAP, '') +
    '])?([' +
    createConversionPattern(POST_SYMBOLS_MAP) +
    '])*)([' +
    createConversionPattern(REFF) +
    '])?([\u00E6vxyz\u201C\u2013~\u0192\u201A\u201E\u2026]?)([' +
    createConversionPattern(POST_SYMBOLS_MAP) +
    '])*',
  'g',
);

const HASAANT_PATTERN = new RegExp('(' + escapeRegExp('্') + ')+');

const PRE_CONVERSION_PATTERN = new RegExp(
  '(' + createConversionPattern(PRE_CONVERSION_MAP, '|') + ')',
  'g',
);

const POST_CONVERSION_PATTERN = new RegExp(
  '(' + createConversionPattern(POST_CONVERSION_MAP, '|') + ')',
  'g',
);

function replaceSymbol(m: string) {
  return ALL_SYMBOLS[m] || '';
}

function mainConverter(
  match: string,
  preKaar: string,
  mUnit: string,
  g3: string,
  g4: string,
  g5: string,
  reff: string,
  postKaar: string,
  postPhala: string,
) {
  let core = mUnit.replace(SYMBOLS_CONVERSION_PATTERN, replaceSymbol);
  core = core.replace(HASAANT_PATTERN, () => '্');
  core = reff ? 'র্' + core : core;
  core = postPhala ? core + POST_SYMBOLS_MAP[postPhala] : core;
  const kaarString =
    '' + (preKaar ? KAARS[preKaar] : '') + (postKaar ? KAARS[postKaar] : '');
  core = core + (KAAR_POST_CONVERSION[kaarString] || kaarString);
  return core;
}

function bnAnsiToUnicode(string: string) {
  let convWord = string.replace(
    PRE_CONVERSION_PATTERN,
    (m) => PRE_CONVERSION_MAP[m] || m,
  );
  convWord = convWord.replace(MAIN_CONVERSION_PATTERN, mainConverter);
  convWord = convWord.replace(
    POST_CONVERSION_PATTERN,
    (m) => POST_CONVERSION_MAP[m] || m,
  );
  convWord = convWord.replace(//g, '×').replace(//g, '∴');

  return convWord;
}

function reverseConverter(input: string) {
  // Simplified reverse conversion logic
  let reversed = input;

  // Reverse the post-conversion map
  for (const key in POST_CONVERSION_MAP) {
    const value = POST_CONVERSION_MAP[key];
    reversed = reversed.split(value).join(key);
  }

  // Reverse the main conversion pattern (approximation)
  for (const key in CONVERSION_MAP) {
    const value = CONVERSION_MAP[key];
    reversed = reversed.split(value).join(key);
  }

  // Reverse other simple replacements (approximation)
  for (const key in ALL_SYMBOLS) {
    const value = ALL_SYMBOLS[key];
    reversed = reversed.split(value).join(key);
  }

  // Reverse certain patterns (approximation)
  reversed = reversed.split('র্').join(''); // Reverting 'র্'
  reversed = reversed.replace(/া/g, 'v'); // Reverting 'া'

  // Note: More complex reversals would require a deeper understanding of Bengali grammar

  return reversed;
}

export { bnAnsiToUnicode, reverseConverter };
