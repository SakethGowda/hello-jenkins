const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello from Jenkins CI/CD!'));

module.exports = app;

if (require.main === module) {
  app.listen(3000, () => console.log('Running on port 3000'));
}