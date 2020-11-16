const router = require('express').Router();
module.exports = router;
const DataLayer = require('../companydata/index');
const user = 'lxp3901';
const dl = new DataLayer(user);

router.delete('/company/:company', (req, res) => {
    const company = req.params.company;
    if (validateCompany(company)) {
        dl.deleteCompany(company);
    }
    else {
        return res.status()
    }

});



function validateCompany(company) {
    return company === user;
}

function createError(code, message) {
    return 
}