// HVAC Toolbox — engine test vectors (single source of truth).
//
// The vector list itself lives at app/js/data/vectors.js because the shipping app needs it too:
// app/js/modules/validate.js runs exactly these vectors in the browser (Data Authenticity page)
// and app/sw.js precaches the file for offline use. This module used to hold a second, hand-kept
// copy, which silently drifted — five ice-branch psychrometric vectors added to the app copy were
// never executed by `npm test`, so a 1000x error in a Hyland-Wexler coefficient stayed invisible.
//
// Node imports through here, so `node tests/run_tests.mjs` and the in-app self-check always run the
// same list. Add vectors to app/js/data/vectors.js only — never fork them again.
export { vectors } from '../app/js/data/vectors.js';
