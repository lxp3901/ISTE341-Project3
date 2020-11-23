require("../validations.js"); // Business layer logic
require('../companydata/index');

const router      = require('express').Router();

module.exports    = router;

const DataLayer   = require('../companydata/index');

const user        = 'lxp3901';
const dl          = new DataLayer(user);
const BAD_REQUEST = 400; // invalid request syntax
const NOT_FOUND   = 404; 
const OK          = 200; // GET, DELETE, PUT
const CREATED     = 201; // POST

// COMPANY - DELETE
router.delete('/company', (req, res) => {
    const {company} = req.query;
    return handleRequest(res, company, () => {
        if (dl.deleteCompany(company) < 1) {
            return createError(NOT_FOUND, 'Could not find company records to delete.', res);
        }
        return createSuccessJSON(OK, 'Successfully deleted company records.', res);
    });
});

// DEPARTMENT - GET ONE
router.get('/department', (req, res) => {
    const {company} = req.query;
    const {dept_id} = req.query;
    if (isValidNumID(dept_id)) {
        return handleRequest(res, company, () => {
            const dept = dl.getDepartment(dept_id);
            return dept ? createGETResponse(OK, dept, res) : createError(NOT_FOUND, 'Department not found.', res);
        });
    }
    return createError(BAD_REQUEST, 'Provided id is not valid.', res);
});

// DEPARTMENT - GET ALL
router.get('/departments', (req, res) => {
    const {company} = req.query;
    return handleRequest(res, company, () => {
        const depts = dl.getAllDepartment(company);
        return createGETResponse(OK, depts, res);
    });
});

// DEPARTMENT - UPDATE
router.put('/department', (req, res) => {
    const form = req.body;
    // check for company
    if (!Object.keys(form).includes('company')) { return createError(BAD_REQUEST, 'Company name was not provided.', res); }
    const {company} = form;
    const {dept_id} = form;
    if (dept_id === undefined) { return createError(BAD_REQUEST, 'Department id was not provided', res); }

    // handle request
    return handleRequest(res, company, () => {
        // validations

        const existingDept = dl.getDepartment(company, dept_id);
        if (!existingDept) { return createError(NOT_FOUND, 'Department not found.', res); }
        if (Object.keys(form).includes('dept_no')) {
            const dept = dl.getDepartmentNo(form.company, form.dept_no);
            if (dept) {
                if (dept.getID() !== existingDept.getID()) { 
                    return createError(BAD_REQUEST, 'Department number is not unique.', res);
                }
            }
        }
        const updated_dept = dl.updateDepartment(updateDepartment(form, existingDept));
        return updated_dept ? createSuccessJSON(OK, updated_dept, res) : createError(NOT_FOUND, 'Record not found.', res);
    });
});

// DEPARTMENT - CREATE
router.post('/department', (req, res) => {
    const form = req.body;
    if (!Object.keys(form).includes('company')) { return createError(BAD_REQUEST, 'Company name was not provided.', res); }
    const {company} = form;
    let dept_no;
    if (Object.keys(form).includes('dept_no')) {
        const dept = dl.getDepartmentNo(form.company, form.dept_no);
        if (dept) { 
            return createError(BAD_REQUEST, 'Department number is not unique.', res); 
        }
        dept_no = form.dept_no;
    }
    else {
        return createError(BAD_REQUEST, 'Department number not provided.', res);
    }
    let dept_name;
    if (Object.keys(form).includes('dept_name')) {
        dept_name = form.dept_name;
    }
    else {
        return createError(BAD_REQUEST, 'Department name not provided.', res);
    }

    let location = null;
    if (Object.keys(form).includes('location')) {
        location = form.location;
    }
    
    return handleRequest(res, company, () => {
        const dept = new dl.Department(company, dept_name, dept_no, location);
        return createSuccessJSON(CREATED, dl.insertDepartment(dept), res);
    });
});

// DEPARTMENT - DELETE
router.delete('/department', (req, res) => {
    const {company} = req.query;
    const {dept_id} = req.query;
    if (isValidNumID(dept_id)) {
        return handleRequest(res, company, () => {
            if (dl.deleteDepartment(company, dept_id) < 1) {
                return createError(NOT_FOUND, 'Could not find record to delete.', res);
            }
            return createSuccessJSON(OK, `Department ${dept_id} from ${company} deleted.`, res);
        });
    }
    return createError(BAD_REQUEST, 'Provided id is not valid', res);
});

// EMPLOYEE - GET ONE
router.get('/employee', (req, res) => {
    const {company} = req.query;
    const {emp_id} = req.query;
    if (!isValidNumID(emp_id)) { return createError(BAD_REQUEST, 'Provided id is not valid.', res); }
    return handleRequest(res, company, () => {
        const employee = dl.getEmployee(emp_id);
        return employee ? createGETResponse(OK, employee, res) : createError(NOT_FOUND, 'Employee not found.', res);
    });
});

// EMPLOYEE- GET ALL
router.get('/employees', (req, res) => {
    const {company} = req.query;
    return handleRequest(res, company, () => {
        const employees = dl.getAllEmployee(company);
        return createGETResponse(OK, employees, res);
    });
});

// EMPLOYEE - CREATE
router.post('/employee', (req, res) => {
    const form = req.body;

    // Check that all required fields are sent
    if (!Object.keys(form).includes('company')) { return createError(BAD_REQUEST, 'Company name was not provided.', res); }
    const {company} = form;

    const {dept_id} = form;
    if (dept_id === undefined) { return createError(BAD_REQUEST, 'Missing dept_id', res); }

    const {emp_name} = form;
    if (emp_name === undefined) { return createError(BAD_REQUEST, 'Missing emp_name', res); }

    const {emp_no} = form;
    if (emp_no === undefined) { return createError(BAD_REQUEST, 'Missing emp_no', res); }

    const {hire_date} = form;
    if (hire_date === undefined) { return createError(BAD_REQUEST, 'Missing hire_date', res); }

    const {job} = form;
    if (job === undefined) { return createError(BAD_REQUEST, 'Missing job', res); }

    const {salary} = form;
    if (salary === undefined) { return createError(BAD_REQUEST, 'Missing salary', res); }

    let {mng_id} = form;
    if (mng_id === undefined) { mng_id = 0; }

    // perform validations
    return handleRequest(res, company,  () => {
        const dept = dl.getDepartment(company, dept_id);
        if (!dept) { return createError(NOT_FOUND, 'Could not find department', res); }

        if (mng_id !== 0) {
            const mng = dl.getEmployee(mng_id);
            if (mng) {
                const mng_dept = dl.getDepartment(company, mng.getDeptId());
                if (mng_dept.getCompany() !== company) { return createError(BAD_REQUEST, 'Manager is not part of this company.', res); }
            }
        }

        if (!validateHireDate(hire_date)) { return createError(BAD_REQUEST, 'Hire date is not valid.', res); }

        const emp = new dl.Employee(emp_name, emp_no, hire_date, job, salary, dept_id, mng_id);
        return createSuccessJSON(CREATED, dl.insertEmployee(emp), res);
    });
});

// EMPLOYEE - UPDATE
router.put('/employee', (req, res) => {
    const form = req.body;

    if (!Object.keys(form).includes('company')) { return createError(BAD_REQUEST, 'Company name was not provided.', res); }
    const {company} = form;

    const {emp_id} = form;
    if (emp_id === undefined) { return createError(BAD_REQUEST, 'Emp id was not provided', res); }
    
    // perform validations
    return handleRequest(res, company, () => {
        const existing_emp = dl.getEmployee(emp_id);
        const updated_emp = updateEmployee(form, existing_emp);
        return updated_emp ? createSuccessJSON(OK, dl.updateEmployee(updated_emp), res) : createError(NOT_FOUND, 'Record not found.', res);
    });
});

// EMPLOYEE - DELETE
router.delete('/employee', (req, res) => {
    const {company} = req.query;
    const {emp_id} = req.query;

    if (!isValidNumID(emp_id)) { return createError(BAD_REQUEST, 'Emp_id is not valid', res); }
    return handleRequest(res, company, () => {
        if (dl.deleteEmployee(emp_id) < 1) {
            return createError(NOT_FOUND, 'Could not find record to delete.', res);
        }
        
            return createSuccessJSON(OK, `Employee ${emp_id} deleted.`, res);
        
    });
});

// TIMECARD - GET ONE
router.get('/timecard', (req, res) => {
    const {company} = req.query;
    const {timecard_id} = req.query;

    if (!isValidNumID(timecard_id)) { return createError(BAD_REQUEST, 'Timecard id is not valid.', res); }
    return handleRequest(res, company, () => {
        const timecard = dl.getTimecard(timecard_id);
        return timecard ? createGETResponse(OK, timecard, res) : createError(NOT_FOUND, 'Timecard not found.', res);
    });
});

// TIMECARD - GET ALL
router.get('/timecards', (req, res) => {
    const {company} = req.query;
    const {emp_id} = req.query;
    if (!isValidNumID(emp_id)) { return createError(BAD_REQUEST, 'Employee id is not valid.', res); }
    return handleRequest(res, company, () => {
        const timecards = dl.getAllTimecard(emp_id);
        return createGETResponse(OK, timecards, res);
    });
});

// TIMECARD - CREATE
router.post('/timecard', (req, res) => {
    const form = req.body;
    const {company} = form;
    if (company === undefined) { return createError(BAD_REQUEST, 'Company not provided.', res); }
    const {emp_id} = form;
    if (emp_id === undefined) { return createError(BAD_REQUEST, 'emp_id not provided.', res); }
    const {start_time} = form;
    if (start_time === undefined) { return createError(BAD_REQUEST, 'start_time not provided.', res); }
    const {end_time} = form;
    if (end_time === undefined) { return createError(BAD_REQUEST, 'end_time not provided.', res); }

    // perform validations
    return handleRequest(res, company, () => {
        if (!validateStartTime(start_time)) { return createError(BAD_REQUEST, 'Start time is not valid.', res); }
        if (!validateEndTime(start_time, end_time)) { return createError(BAD_REQUEST, 'End time is not valid.', res); }
        const timecard = new dl.Timecard(start_time, end_time, emp_id); // Timestamp start, end, emp_id
        return createSuccessJSON(CREATED, dl.insertTimecard(timecard), res);
    });
})

// TIMECARD - UPDATE
router.put('/timecard', (req, res) => {
    const form = req.body;
    const {company} = form;
    if (company === undefined) { return createError(BAD_REQUEST, 'Company not provided.', res); }
    const {timecard_id} = form;
    if (timecard_id === undefined) { return createError(BAD_REQUEST, 'Timecard id not provided.', res); }
    

    // perform validations
    return handleRequest(res, company, () => {
        const existing_timecard = dl.getTimecard(timecard_id);
        if (!existing_timecard) { return createError(NOT_FOUND, 'Timecard not found.', res); }
        const updated_timecard = updateTimecard(form);
        return updated_timecard ? createSuccessJSON(OK, dl.updateTimecard(updated_timecard), res) : createError(NOT_FOUND, 'Record not found.', res);
    });
});

// TIMECARD - DELETE
router.delete('/timecard', (req, res) => {
    const {company} = req.query;
    const {timecard_id} = req.query;

    if (!isValidNumID(timecard_id)) { return createError(BAD_REQUEST, 'Timecard id is not valid', res); }
    return handleRequest(res, company, () => {
        if (dl.deleteTimecard(timecard_id) < 1) {
            return createError(NOT_FOUND, 'Could not find record to delete.', res);
        }
        return createSuccessJSON(OK, `Timecard ${timecard_id} deleted.`, res);
    });
});


function updateDepartment(form, existingDept) {
    if (Object.keys(form).includes('dept_name')) {
        existingDept.setDeptName(form.dept_name);
    }
    if (Object.keys(form).includes('location')) {
        existingDept.setLocation(form.location);
    }
    return existingDept
}


function updateTimecard(form, existingTimecard) {
    const {emp_id} = form;
    if (emp_id !== undefined) { existingTimecard.setEmpId(emp_id); }
    const {start_time} = form;
    if (start_time !== undefined) { existingTimecard.setStartTime(start_time); }
    const {end_time} = form;
    if (end_time !== undefined) { existingTimecard.setEndTime(end_time); }
    return existingTimecard
}


function updateEmployee(form, existingEmp) {
    const {dept_id} = form;
    if (dept_id !== undefined) { existingEmp.setDeptId(dept_id); }

    const {emp_name} = form;
    if (emp_name !== undefined) { existingEmp.setEmpName(emp_name); }

    const {emp_no} = form;
    if (emp_no !== undefined) { existingEmp.setEmpNo(emp_no); }

    const {hire_date} = form;
    if (hire_date !== undefined) { existingEmp.setHireDate(hire_date); }

    const {job} = form;
    if (job !== undefined) { existingEmp.setJob(job); }

    const {salary} = form;
    if (salary !== undefined) { existingEmp.setSalary(salary); }

    const {mng_id} = form;
    if (mng_id !== undefined) { existingEmp.setMngId(mng_id); }

    return existingEmp;
}


/**
 * Validates that the company name is the same as the hard coded user
 * @param {String} company 
 */
function validateCompany(company) {
    return company === user;
}


/**
 * Returns a json response with HTTP code 404
 * @param {Response object} res 
 */
function invalidCompanyName(res) {
    return createError(NOT_FOUND, 'Company name is not valid', res);
}


/**
 * Wraps the handling of the request in a validation and try catch block
 * in case there is an error with querying the data layer.
 * @param {Response object} res
 * @param {String} company 
 * @param {Function} callback 
 */
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


/**
 * Returns json error response
 * @param {Integer} code 
 * @param {String} message 
 * @param {Response object} res 
 */
function createError(code, message, res) {
    return res.status(code).json({ "error": message });
}


/**
 * Returns a success response
 * @param {Integer} code 
 * @param {String} content 
 * @param {Response object} res 
 */
function createSuccessJSON(code, content, res) {
    return res.status(code).json({ "success": content });
}


/**
 * Takes records and converts them to json
 * @param {Integer} code 
 * @param {*} resources 
 * @param {Response object} res 
 */
function createGETResponse(code, resources, res) {
    return res.status(code).json(resources);
}


function isValidNumID(id) {
    return !isNaN(id);
}