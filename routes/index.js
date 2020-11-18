const router      = require('express').Router();
module.exports    = router;
const companydata = require('../companydata/index');
const DataLayer   = require('../companydata/index');
const user        = 'lxp3901';
const dl          = new DataLayer(user);
const BAD_REQUEST = 400; // invalid request syntax
const NOT_FOUND   = 404; 
const OK          = 200; // GET, DELETE, PUT
const CREATED     = 201; // POST

router.delete('/company', (req, res) => {
    const company = req.query.company;
    return handleRequest(res, company, () => {
        dl.deleteCompany(company);
        return createSuccessJSON(OK, 'Successfully deleted record.', res);
    });
});

router.get('/department', (req, res) => {
    const company = req.query.company;
    const dept_id = req.query.dept_id;
    return handleRequest(res, company, () => {
        dept = dl.getDepartment(dept_id);
        return dept ? createGETResponse(OK, dept, res) : createError(NOT_FOUND, 'Department not found.', res);
    });
});

router.get('/departments', (req, res) => {
    const company = req.query.company;
    return handleRequest(res, company, () => {
        depts = dl.getAllDepartment(company);
        return createGETResponse(OK, depts, res);
    });
});

router.put('/department', (req, res) => {
    const req_dept = req.body;
    const company  = req_dept['company'];
    const dept_id  = req_dept['dept_id'];
    const dept_name= req_dept['dept_name'];
    const dept_no  = req_dept['dept_no'];
    const location = req_dept['location'];

    // TODO validate json
    
    // handle request
    return handleRequest(res, company, () => {
        const dept = new dl.Department(company, dept_name, dept_no, location);
        updated_dept = dl.updateDepartment(dept);
        return updated_dept ? createSuccessJSON(OK, updated_dept, res) : createError(NOT_FOUND, 'Record not found.', res);
    });
});

router.post('/department', (req, res) => {
    const form = req.body;
    const company   = form['company'];
    const dept_name = form['dept_name'];
    const dept_no   = form['dept_no'];
    const location  = form['location'];

    // TODO - validation, create an updateDepartment function that creates a dept object with new values if provided
    
    return handleRequest(res, company, () => {
        let dept = new dl.Department(company, dept_name, dept_no, location);
        return createSuccessJSON(CREATED, dl.insertDepartment(dept), res);
    });
});

router.delete('/department', (req, res) => {
    const company = req.query.company;
    const dept_id = req.query.dept_id;
    return handleRequest(res, company, () => {
        if (dl.deleteDepartment(company, dept_id) < 1) {
            return createError(NOT_FOUND, 'Could not find record to delete.', res);
        }
        else {
            return createSuccessJSON(OK, `Department ${dept_id} from ${company} deleted.`, res);
        }
    });
});

router.get('/employee', (req, res) => {
    const company = req.query.company;
    const emp_id  = req.query.emp_id;
    return handleRequest(res, company, () => {
        employee = dl.getEmployee(emp_id);
        return employee ? createGETResponse(OK, employee, res) : createError(NOT_FOUND, 'Employee not found.', res);
    });
});

router.get('/employees', (req, res) => {
    const company = req.query.company;
    return handleRequest(res, company, () => {
        employees = dl.getAllEmployee(company);
        return createGETResponse(OK, employees, res);
    });
});

router.post('/employee', (req, res) => {
    const form = req.body;
    const company = form['company'];
    const emp_name = form['emp_name'];
    const emp_no = form['emp_no'];
    const hire_date = form['hire_date'];
    const job = form['job'];
    const salary = form['salary'];
    const dept_id = form['dept_id'];
    const mng_id = form['mng_id'];

    // perform validations
    return handleRequest(res, company,  () => {
        let emp = new dl.Employee(emp_name, emp_no, hire_date, job, salary, dept_id, mng_id);
        return createSuccessJSON(CREATED, dl.insertEmployee(emp), res);
    });
});

router.put('/employee', (req, res) => {
    const req_emp = req.body;
    const company = form['company'];
    const emp_id  = form['emp_id'];
    const emp_name = form['emp_name'];
    const emp_no = form['emp_no'];
    const hire_date = form['hire_date'];
    const job = form['job'];
    const salary = form['salary'];
    const dept_id = form['dept_id'];
    const mng_id = form['mng_id'];

    // perform validations
    return handleRequest(res, company, () => {
        let updated_emp; // get updated emp
        return updated_emp ? createSuccessJSON(CREATED, dl.updateEmployee(emp), res) : createError(NOT_FOUND, 'Record not found.', res);
    });
});



function validateCompany(company) {
    return company === user;
}


function invalidCompanyName(res) {
    return createError(NOT_FOUND, 'Company name is not valid', res);
}


function handleRequest(res, company, callback) {
    if (validateCompany(company)) {
        try {
            return callback();
        }
        catch (error) {
            return createError(NOT_FOUND, error.message, res); // There was an error with the data layer request
        }
    }
    else {
        // Company name is not valid
        return invalidCompanyName(res);
    }
}


function createError(code, message, res) {
    return res.status(code).json({ "error": message });
}


function createSuccessJSON(code, content, res) {
    return res.status(code).json({ "success": content });
}


function createGETResponse(code, resources, res) {
    return res.status(code).json(resources);
}