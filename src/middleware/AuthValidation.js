const Joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400)
            .json({ message: "Bad request", error })
    }
    next();
}
const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400)
            .json({ message: "Bad request", error })
    }
    next();
}
const accessUserValidation = (req, res, next) => {
    const schema = Joi.object({
      fullname: Joi.string().min(3).max(100).required(),
      mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(100).required(),
      date_of_hiring: Joi.date().iso().required(),
      designation: Joi.string().min(2).max(100).required(),
      supervisor: Joi.string().min(3).max(100).required(),
      salary: Joi.number().positive().required(),
      shift: Joi.string().valid('Day', 'Night', 'Evening').required(),
      other_designation: Joi.array().items(Joi.string().min(2).max(100)).required(),
    });
  
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Bad request", error: error.details });
    }
    next();
  };
module.exports = {
    signupValidation,
    loginValidation,
    accessUserValidation
}