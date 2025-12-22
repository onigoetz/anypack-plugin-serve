const path = require('path');

const polka = require('polka');
const sirv = require('sirv');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const renderer = require(path.resolve(DIST_DIR, 'server.js'));

const app = polka();
app.use(renderer);
app.use(sirv(DIST_DIR));

app.listen(3000, () => {
  console.log(`Server started at port ${3000}`);
});
