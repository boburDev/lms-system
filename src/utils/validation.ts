import Joi from 'joi'

export const validateObjectSignup = (input: object) => {
    const schema = Joi.object().keys({
        userName: Joi.string().min(2).required(),
        userPhone: Joi.string().min(12).max(12).required(),
        companyName: Joi.string().min(2).required(),
        password: Joi.string().min(5).required()
    })
    return schema.validate(input)
}
