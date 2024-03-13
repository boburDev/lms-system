import Joi from 'joi'

export const validateObjectSignup = (input: object) => {
    const schema = Joi.object().keys({
        derectorName: Joi.string().min(2).required(),
        derectorPhone: Joi.string().min(12).max(12).required(),
        companyName: Joi.string().min(2).required(),
        companyPhone: Joi.string().min(12).max(12).required(),
        password: Joi.string().min(5).required(),
        districtId: Joi.string().min(5).required()
    })
    return schema.validate(input)
}
