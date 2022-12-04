const { isEmpty } = require("./helpers.validator")

const Store = data => {
    let error = {}

    if (!data.role || isEmpty(data.role)) error.role = "Role is required."
    if (!data.rights || isEmpty(data.rights)) error.rights = "Rights is required."

    return {
        error,
        isValid: Object.keys(error).length === 0
    }
}

module.exports = {
    Store
}