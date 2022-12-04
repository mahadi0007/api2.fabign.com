const { Schema, model } = require("mongoose")

const validateEmail = function (email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email)
}

const adminSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validateEmail, "Please provide a valid email address"],
    },
    phone: {
        type: String,
        trim: true,
        require: true
    },
    address: {
        present_address: {
            type: String,
            trim: true,
            default: null
        },
        permanent_address: {
            type: String,
            trim: true,
            default: null
        }
    },
    image: {
        type: String,
        trim: true,
        require: true
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: true
    },
    isOnline: {
        type: Boolean,
        default: false,
        enum: [true, false]
    },
    status: {
        type: String,
        trim: true,
        default: 'Active',
        enum: ['Active', 'Deactive']
    },
    password: {
        type: String,
        trim: true,
        required: true
    }
}, {
    timestamps: true
})


const Admin = model("Admin", adminSchema)
module.exports = Admin
