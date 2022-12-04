
const { isEmail, isPhone, isEmpty } = require("./helpers.validator")

const Store = data => {
    let error = {}
    
    if (!data.name || isEmpty(data.name)) error.name = "Name is required"
    if (!data.email || isEmpty(data.email)) error.email = "Email is required"
    if (data.email) {
        if (!isEmail(data.email)) error.email = "Address isn't valid"
    }

    if (!data.phone || isEmpty(data.phone)) error.phone = "Phone Number is Required"
    if (data.phone) {
        if (!isPhone(data.phone)) error.phone = "Phone number isn't valid"
    }

    if (!data.image || isEmpty(data.image)) error.image = "Image is required"
    if (!data.present_address || isEmpty(data.present_address)) error.present_address = "Present address is required"
    if (!data.permanent_address || isEmpty(data.permanent_address)) error.permanent_address = "Permanent address is required"
    if (!data.role || isEmpty(data.role)) error.role = "Role is required"
    if (!data.password || isEmpty(data.password)) error.password = "Password is required"

    return {
        error,
        isValid: Object.keys(error).length === 0
    }
}



module.exports = {
    Store
}