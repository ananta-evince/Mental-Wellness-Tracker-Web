const base = 'https://aurorawellness-gamma.vercel.app';
const html = await fetch(base).then((r) => r.text());
const scripts = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1]);

for (const src of scripts) {
  const js = await fetch(base + src).then((r) => r.text());
  if (js.includes('Welcome to Aurora') || js.includes('What should I call you') || js.includes('Dashboard')) {
    console.log('APP CHUNK:', src, 'size:', js.length);
    const readable = [...js.matchAll(/"([A-Za-z][^"\\]{5,100})"/g)]
      .map((m) => m[1])
      .filter((s) =>
        !s.includes('function') &&
        !s.includes('return') &&
        !s.includes('Error') &&
        !s.includes('next') &&
        !s.includes('React') &&
        /^[A-Za-z0-9 ,.'!?→–—\-:;]+$/.test(s)
      );
    [...new Set(readable)].forEach((s) => console.log(' ', s));
  }
}

const cssMatch = html.match(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/);
if (cssMatch) {
  const css = await fetch(base + cssMatch[1]).then((r) => r.text());
  const midnight = css.match(/midnight[^}]{0,200}/g);
  console.log('\n=== midnight classes ===');
  midnight?.slice(0, 10).forEach((m) => console.log(m.slice(0, 150)));
  const glow = css.match(/glow[^}]{0,200}/g);
  console.log('\n=== glow classes ===');
  glow?.slice(0, 5).forEach((m) => console.log(m.slice(0, 150)));
}
