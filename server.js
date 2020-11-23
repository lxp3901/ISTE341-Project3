const express = require('express')
const app     = express();
const routes  = require('./routes/index');
const port    = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/CompanyServices', routes);

app.listen(port, () => console.log('Listening on port 8080...'));