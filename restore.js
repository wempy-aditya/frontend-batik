const fs = require('fs');
const f = 'app/microsatellite-status/page.js';
const c = fs.readFileSync(f, 'utf8');
const mangledStart = c.indexOf('ate, useRef, useCallback, useEffect } from "react";', 100);
if (mangledStart !== -1) {
  const original = 'import { useSt' + c.substring(mangledStart);
  fs.writeFileSync(f, original);
  console.log('Restored original file, length: ' + original.length);
} else {
  console.log('Not mangled?');
}
