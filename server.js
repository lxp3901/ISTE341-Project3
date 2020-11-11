import { urlencoded } from 'express';
const app = express();
const port = 8080;

import DataLayer from './companydata/index.js';
let dl = new DataLayer("lxp3901");

// app.use(urlencoded({extended:false}))

app.get('/', (req, res) => {

});


