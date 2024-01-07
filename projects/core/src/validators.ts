import type { FieldValidator } from './column-interfaces.js'
import { isBackend } from './context.js'
import type { ValidateFieldEvent } from './remult3/remult3.js'

export class Validators {
  static required = createValidator<any>(
    async (_, e) =>
      e.value != null && e.value != undefined && e.value !== '' && e.value != 0,

    'Should not be empty',
  )

  static unique = createValidator<any>(async (_, e) => {
    if (!e.entityRef)
      throw 'unique validation may only work on columns that are attached to an entity'

    if (e.isBackend() && (e.isNew || e.valueChanged())) {
      return (
        (await e.entityRef.repository.count({
          [e.metadata.key]: e.value,
        })) == 0
      )
    } else return true
  }, 'already exists')
  /**
   * @deprecated is `unique` instead - it also runs only on the backend
   */
  static uniqueOnBackend = createValidator<any>(async (_, e) => {
    if (e.isBackend() && (e.isNew || e.valueChanged())) {
      return (
        (await e.entityRef.repository.count({
          [e.metadata.key]: e.value,
        })) == 0
      )
    } else return true
  }, Validators.unique.defaultMessage)

  static regex = createValueValidatorWithArgs<string, RegExp>((val, regex) =>
    regex.test(val),
  )
  static email = createValueValidator<string>(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    'Invalid Email',
  )
  static url = createValueValidator<string>(
    (val) => !!new URL(val),
    'Invalid Url',
  )
  static in = createValueValidatorWithArgs<any, any[]>(
    (val, values) => values.includes(val),
    (values) => `Value must be one of ${values.join(', ')}`,
  )

  static notNull = createValueValidator(
    (val) => val != null,
    'Should not be null',
  )
  static enum = createValueValidatorWithArgs(
    (value, enumObj) => Object.values(enumObj).includes(value),
    (enumObj) => `Value must be one of ${Object.values(enumObj).join(', ')}`,
  )
  static relationExists = createValidator<any>(async (_, e) => {
    if (e.valueIsNull()) return true
    if (!e.isBackend()) return true
    return Boolean(await e.load())
  }, 'Relation value does not exist')

  static maxLength = createValueValidatorWithArgs<string, number>(
    (val, maxLength) => val.length <= maxLength,
    (maxLength) => `Value must be at most ${maxLength} characters`,
  )

  static defaultMessage = 'Invalid value'
}

export type Validator<valueType> = FieldValidator<any, valueType> &
  ((message?: string) => FieldValidator<any, valueType>) & {
    defaultMessage: ValidationMessage<valueType, undefined>
    /**
     * @deprecated  use (message:string) instead - for example: Validators.required("Is needed")
     */
    withMessage(message: string): FieldValidator<any, valueType>
  }

export function createValidator<valueType>(
  validate: (
    entity: any,
    e: ValidateFieldEvent<any, valueType>,
  ) => Promise<boolean | string> | boolean | string,
  defaultMessage?: ValidationMessage<valueType, undefined>,
): Validator<valueType> {
  const validation = async (
    entity: any,
    e: ValidateFieldEvent<any, valueType>,
    message?: string,
  ) => {
    const valid = await validate(entity, e)
    if (typeof valid === 'string' && valid.length > 0) e.error = valid
    else if (!valid)
      e.error =
        message ||
        (typeof defaultMessage === 'function' &&
          defaultMessage(entity, e, undefined)) ||
        (defaultMessage as string) ||
        Validators.defaultMessage
  }
  const result = (
    entityOrMessage: any,
    e?: ValidateFieldEvent<any, valueType>,
    message?: string,
  ) => {
    if (
      typeof entityOrMessage === 'string' ||
      (entityOrMessage === undefined && e === undefined)
    ) {
      return async (entity, e, message) =>
        await validation(entity, e, entityOrMessage || message)
    }
    return validation(entityOrMessage, e!, message)
  }

  //@ts-ignore
  return Object.assign(result, {
    withMessage:
      (message: string) =>
      async (entity: any, e: ValidateFieldEvent<any, valueType>) =>
        result(entity, e, message),

    get defaultMessage() {
      return defaultMessage
    },
    set defaultMessage(val) {
      defaultMessage = val
    },
    isValid: validate,
  })
}

export function valueValidator<valueType>(
  validate: (value: valueType) => boolean | string | Promise<boolean | string>,
  message?: string,
) {
  return (entity: any, e: ValidateFieldEvent<any, valueType>) =>
    validate(e.value) || message || false
}

export function createValueValidator<valueType>(
  validate: (value: valueType) => boolean | string | Promise<boolean | string>,
  message?: ValidationMessage<valueType, undefined>,
) {
  return createValidator<valueType>((_, e) => {
    if (e.value === undefined || e.value === null) return true
    return validate(e.value)
  }, message)
}
export function createValueValidatorWithArgs<valueType, argsType>(
  validate: (
    value: valueType,
    args: argsType,
  ) => boolean | string | Promise<boolean | string>,
  defaultMessage?: ValueValidationMessage<argsType>,
): ValidatorWithArgs<valueType, argsType> & {
  defaultMessage: ValueValidationMessage<argsType>
} {
  const result = createValidatorWithArgs<valueType, argsType>(
    (_, e, args) => {
      if (e.value === undefined || e.value === null) return true
      return validate(e.value, args)
    },
    (_, e, args) =>
      (typeof defaultMessage === 'function' && defaultMessage(args)) ||
      (defaultMessage as string),
  )
  return Object.assign((entity, e) => result(entity, e), {
    get defaultMessage() {
      return defaultMessage
    },
    set defaultMessage(val) {
      defaultMessage = val
    },
  })
}

export type ValueValidationMessage<argsType> =
  | string
  | ((args: argsType) => string)

export type ValidationMessage<valueType, argsType> =
  | string
  | ((
      entity: any,
      event: ValidateFieldEvent<any, valueType>,
      args: argsType,
    ) => string)

export type ValidatorWithArgs<valueType, argsType> = (
  args: argsType,
  message?: string,
) => FieldValidator<any, valueType>

export function createValidatorWithArgs<valueType, argsType>(
  validate: (
    entity: any,
    e: ValidateFieldEvent<any, valueType>,
    args: argsType,
  ) => Promise<boolean | string> | boolean | string,
  defaultMessage: ValidationMessage<valueType, argsType>,
): ValidatorWithArgs<valueType, argsType> & {
  defaultMessage: ValidationMessage<valueType, argsType>
} {
  const result =
    (args: argsType, message?: string) =>
    async (entity: any, e: ValidateFieldEvent<any, valueType>) => {
      const valid = await validate(entity, e, args)
      if (typeof valid === 'string') e.error = valid
      else if (!valid)
        e.error =
          message || defaultMessage
            ? typeof defaultMessage === 'function'
              ? defaultMessage(entity, e, args)
              : defaultMessage
            : Validators.defaultMessage
    }

  return Object.assign(result, {
    get defaultMessage() {
      return defaultMessage
    },
    set defaultMessage(val) {
      defaultMessage = val
    },
  })
}

// create basic validator, lambda value , default message & generic type for the parameter
/*
V - required to support being called with optional message :
V * - validators.required("message")
V * - validators.required()
V * - validators.required
V - same for unique and unique on backend.
V - deprecate withMessage

     https://github.com/colinhacks/zod/blob/3e4f71e857e75da722bd7e735b6d657a70682df2/src/locales/en.ts#L98
//V - string | (args)=>string
//V - string | (entity,ref,args)=>string
//V - simple validator not to validate undefined | null
//V - all validators should not throw exception on empty values - it should value
//V - add IsBackend to LifeCycleEvent
//V - Implement validateFieldEvent
//V - make unique only backend
//V - depricate uniqeOnBackend
//V - relation exist should happen on backend (or non proxy)
//V - added isNew to ValidateFieldEvent
*/

/* 
* V - support string argument in validation
  V - valueValidator create two basic validators - with and without args.
* V - createValueValidator
* V - createValueValidator with options
* V - required - !=0 !='' != null != undefined
* V - email
* V - url
* V - regex
* V - in
* V - not null
* VV - enum
* V - relation exists
* V - max length should be enforced? from options - where the default message will be from the validators
* V - required as field option
//V - consider placing from json exceptions errors as validations error (like zod parse)
*/
// view issue
//p1 - symbol for!!
//p1 - globalThis for that is static
//p1 - remove reflect metadata
