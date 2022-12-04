const { isEmpty } = require("./helpers.validator")

const Store = data => {
    let error = {}

    if (!data.title || isEmpty(data.title)) error.title = "Title is required"
    if (!data.link || isEmpty(data.link)) error.link = "Link is required"

    if (data.files) {
        if (!data.files.icon || isEmpty(data.files.icon)) error.icon = "Icon is required"
    }

    return {
        error,
        isValid: Object.keys(error).length === 0
    }
}

module.exports = {
    Store
}