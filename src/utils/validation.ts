import Joi from 'joi'

export const validateObjectSignup = (input: object) => {
    const schema = Joi.object().keys({
        derectorName: Joi.string().min(2).required(),
        derectorPhone: Joi.string().min(12).max(12).required(),
        companyName: Joi.string().min(2).required(),
        companyPhone: Joi.string().min(12).max(12).required(),
        password: Joi.string().min(5).required(),
        code: Joi.string().min(6).max(6).required(),
        districtId: Joi.string().min(5).required()
    })
    return schema.validate(input)
}

export const validateObjectCreateAdmin = (input: object) => {
    const schema = Joi.object().keys({
        username: Joi.string().min(2).required(),
        name: Joi.string().min(2).required(),
        lastname: Joi.string().min(2).required(),
        phone: Joi.string().min(12).max(12).required(),
        role: Joi.number().required().valid(1, 2, 3),
        password: Joi.string().min(5).required()
    })
    return schema.validate(input)
}

export const validateObjectNewPassword = (input: object) => {
    const schema = Joi.object().keys({
        code: Joi.string().min(6).max(6).required(),
        subdomain: Joi.string().min(2).required(),
        userphone: Joi.string().min(12).max(12).required(),
        new_password: Joi.string().min(5).required()
    })
    return schema.validate(input)
}