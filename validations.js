var moment = require('moment');
moment().format();

const BUSINESS_OPEN = 8; // 8AM
const BUSINESS_CLOSE = 18; // 6PM

function validateDateTime(datetime) {
    let moment = moment(datetime, "YYYY-MM-DD hh:mm:ss", true);
    if (moment.isValid) {
        return moment;
    }
    else {
        return false;
    }
}


function validateDate(date) {
    let moment = moment(date, "YYYY-MM-DD", true);
    if (moment.isValid) {
        return moment;
    }
    else {
        return false;
    }
}


function today() {
    return moment().startOf('day');
}


function isWeekday(date) {
    return (![0, 6].includes(date.day()));
}


function duringBusinessHours(datetime) {
    if (datetime.hour() == BUSINESS_CLOSE) {
        return datetime.minute() == 00;
    }
    else {
        return (datetime.hour() >= BUSINESS_OPEN && datetime.hour() < BUSINESS_CLOSE);
    }
    
}


function validateHireDate(date) {
    let hiredate = validateDate(date);
    if (hiredate) {
        // must be current day or earlier and must be a weekday
        return (hiredate.diff(today(), 'days') <= 0 && isWeekday(hiredate));
    }
    else {
        return false;
    }
}


function validateStartTime(datetime) {
    let start = validateDateTime(datetime);
    if (start) {
        if (isWeekday(start) && duringBusinessHours(start)) {
            if (today().weekday() == 1) {
                if (start.diff(today(), 'days') >= 0) {
                    return true;
                }
            }
            else {
                let lastmonday = today().startOf('isoWeek');
                if (start.diff(lastmonday, 'days') >= 0) {
                    return true;
                }
            }
        }
    }
    return false;
}


function validateEndTime(start, end) {
    let endtime = validateDateTime(end);
    if (endtime) {
        if (isWeekday(endtime) && duringBusinessHours(endtime)) {
            if (endtime.diff(start, 'hours') >= 1) {
                if (start.isSame(endtime, 'date')) {
                    return true;
                }
            }
        }
    }
    return false;
}