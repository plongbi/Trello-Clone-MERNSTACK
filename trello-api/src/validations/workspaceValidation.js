import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must be less than 50 characters',
      'string.trim': 'Title cannot have leading or trailing whitespace'
    }),
    description: Joi.string().allow('').max(256).trim().default(''),
    type: Joi.string().valid('public', 'private').default('public'),
    logo: Joi.string().allow(null, ''),
    color: Joi.string().default('#0052CC')
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().allow('').max(256).trim(),
    type: Joi.string().valid('public', 'private'),
    logo: Joi.string().allow(null, ''),
    color: Joi.string()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const workspaceValidation = {
  createNew,
  update
}
