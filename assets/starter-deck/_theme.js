const values = {
  primary: '22223B',
  secondary: '4A4E69',
  accent: '9A8C98',
  light: 'C9ADA7',
  bg: 'F2E9E4',
  surface: 'FFFFFF',
  border: 'C9ADA7',
  muted: '4A4E69',
  ink: '22223B'
};

for (const [name, value] of Object.entries(values)) {
  if (!/^[0-9A-F]{6}$/i.test(value)) throw new Error(`Theme token ${name} must be a 6-character hex color without #.`);
}

const theme = new Proxy(Object.freeze(values), {
  get(target, property, receiver) {
    if (typeof property === 'symbol' || Reflect.has(target, property)) {
      return Reflect.get(target, property, receiver);
    }
    throw new Error(`Unknown theme token: ${String(property)}. Add it once in _theme.js before use.`);
  }
});

module.exports = theme;
