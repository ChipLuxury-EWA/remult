import { createId } from '@paralleldrive/cuid2'
import { v4 as uuid } from 'uuid'
import type { ClassType } from '../../classType'
import type { FieldOptions } from '../column-interfaces'
import type { Remult } from '../context'
import type { RelationInfo, relationOptions } from './remult3'
import { ValueConverters } from '../valueConverters'
import { getEntityRef } from './getEntityRef'
import {
  type ClassFieldDecoratorContextStub,
  buildOptions,
  columnsOfType,
  relationInfoMember,
} from './RepositoryImplementation'
import type { columnInfo } from './columnInfo'

export class Fields {
  /**
   * Stored as a JSON.stringify - to store as json use Fields.json
   */
  static object<entityType = any, valueType = any>(
    ...options: (
      | FieldOptions<entityType, valueType>
      | ((options: FieldOptions<entityType, valueType>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, valueType | undefined>,
    c?: any,
  ) => void {
    return Field(undefined, ...options)
  }
  static json<entityType = any, valueType = any>(
    ...options: (
      | FieldOptions<entityType, valueType>
      | ((options: FieldOptions<entityType, valueType>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, valueType | undefined>,
    c?: any,
  ) => void {
    return Field(
      undefined,
      {
        valueConverter: {
          fieldTypeInDb: 'json',
        },
      },
      ...options,
    )
  }
  static dateOnly<entityType = any>(
    ...options: (
      | FieldOptions<entityType, Date>
      | ((options: FieldOptions<entityType, Date>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, Date | undefined>,
    c?: any,
  ) => void {
    return Field(
      () => Date,
      {
        valueConverter: ValueConverters.DateOnly,
      },
      ...options,
    )
  }
  static date<entityType = any>(
    ...options: (
      | FieldOptions<entityType, Date>
      | ((options: FieldOptions<entityType, Date>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, Date | undefined>,
    c?: any,
  ) => void {
    return Field(() => Date, ...options)
  }
  static integer<entityType = any>(
    ...options: (
      | FieldOptions<entityType, Number>
      | ((options: FieldOptions<entityType, Number>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, number | undefined>,
    c?: any,
  ) => void {
    return Field(
      () => Number,
      {
        valueConverter: ValueConverters.Integer,
      },
      ...options,
    )
  }
  static autoIncrement<entityType = any>(
    ...options: (
      | FieldOptions<entityType, Number>
      | ((options: FieldOptions<entityType, Number>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, number | undefined>,
    c?: any,
  ) => void {
    return Field(
      () => Number,
      {
        allowApiUpdate: false,
        dbReadOnly: true,
        valueConverter: {
          ...ValueConverters.Integer,
          fieldTypeInDb: 'autoincrement',
        },
      },
      ...options,
    )
  }

  static number<entityType = any>(
    ...options: (
      | FieldOptions<entityType, Number>
      | ((options: FieldOptions<entityType, Number>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, number | undefined>,
    c?: any,
  ) => void {
    return Field(() => Number, ...options)
  }
  static createdAt<entityType = any>(
    ...options: (
      | FieldOptions<entityType, Date>
      | ((options: FieldOptions<entityType, Date>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, Date | undefined>,
    c?: any,
  ) => void {
    return Field(
      () => Date,
      {
        allowApiUpdate: false,
        saving: (_, ref) => {
          if (getEntityRef(_).isNew()) ref.value = new Date()
        },
      },
      ...options,
    )
  }
  static updatedAt<entityType = any>(
    ...options: (
      | FieldOptions<entityType, Date>
      | ((options: FieldOptions<entityType, Date>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, Date | undefined>,
    c?: any,
  ) => void {
    return Field(
      () => Date,
      {
        allowApiUpdate: false,
        saving: (_, ref) => {
          ref.value = new Date()
        },
      },
      ...options,
    )
  }

  static uuid<entityType = any>(
    ...options: (
      | FieldOptions<entityType, string>
      | ((options: FieldOptions<entityType, string>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, string | undefined>,
    c?: any,
  ) => void {
    return Field(
      () => String,
      {
        allowApiUpdate: false,
        defaultValue: () => uuid(),
        saving: (_, r) => {
          if (!r.value) r.value = uuid()
        },
      },
      ...options,
    )
  }
  static cuid<entityType = any>(
    ...options: (
      | FieldOptions<entityType, string>
      | ((options: FieldOptions<entityType, string>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, string | undefined>,
    c?: any,
  ) => void {
    return Field(
      () => String,
      {
        allowApiUpdate: false,
        defaultValue: () => createId(),
        saving: (_, r) => {
          if (!r.value) r.value = createId()
        },
      },
      ...options,
    )
  }
  static string<entityType = any>(
    ...options: (
      | StringFieldOptions<entityType>
      | ((options: StringFieldOptions<entityType>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, string | undefined>,
    c?: any,
  ) => void {
    return Field(() => String, ...options)
  }
  static boolean<entityType = any>(
    ...options: (
      | FieldOptions<entityType, boolean>
      | ((options: FieldOptions<entityType, boolean>, remult: Remult) => void)
    )[]
  ): (
    target: any,
    context:
      | string
      | ClassFieldDecoratorContextStub<entityType, boolean | undefined>,
    c?: any,
  ) => void {
    return Field(() => Boolean, ...options)
  }

  //TODO - don't like first parameter as current Type - it's pshita :)
  static toMany<entityType, toEntityType>(
    entity: ClassType<entityType>,
    toEntityType: () => ClassType<toEntityType>,
    options:
      | relationOptions<entityType, toEntityType, toEntityType>
      | keyof toEntityType,
  ) {
    return Field(() => undefined!, {
      serverExpression: () => undefined,
      //@ts-ignore
      [relationInfoMember]: {
        //field,
        toType: toEntityType,
      } as RelationInfo,
    })
  }
  static toOne<entityType, toEntityType>(
    entity: ClassType<entityType>,
    toEntityType: () => ClassType<toEntityType>,
    options?:
      | relationOptions<entityType, toEntityType, entityType>
      | keyof entityType,
  ) {
    let op: relationOptions<entityType, toEntityType, entityType> =
      (typeof options === 'string'
        ? { match: options }
        : options) as any as relationOptions<
        entityType,
        toEntityType,
        entityType
      >
    if (!options || (!op.match && !op.where && !op.findOptions)) {
      return Field(toEntityType, {
        //@ts-ignore
        [relationInfoMember]: {
          //field,
          toType: toEntityType,
        } as RelationInfo,
      })
    } else
      return Field(() => undefined!, {
        serverExpression: () => undefined,
        //@ts-ignore
        [relationInfoMember]: {
          //field,
          toType: toEntityType,
        } as RelationInfo,
      })
  }
}

/**Decorates fields that should be used as fields.
 * for more info see: [Field Types](https://remult.dev/docs/field-types.html)
 *
 * FieldOptions can be set in two ways:
 * @example
 * // as an object
 * @Fields.string({ includeInApi:false })
 * title='';
 * @example
 * // as an arrow function that receives `remult` as a parameter
 * @Fields.string((options,remult) => options.includeInApi = true)
 * title='';
 */
export function Field<entityType = any, valueType = any>(
  valueType: () => ClassType<valueType>,
  ...options: (
    | FieldOptions<entityType, valueType>
    | ((options: FieldOptions<entityType, valueType>, remult: Remult) => void)
  )[]
) {
  // import ANT!!!! if you call this in another decorator, make sure to set It's return type correctly with the | undefined

  return (
    target,
    context:
      | ClassFieldDecoratorContextStub<entityType, valueType | undefined>
      | string,
    c?,
  ) => {
    const key = typeof context === 'string' ? context : context.name.toString()
    let factory = (remult: Remult) => {
      let r = buildOptions(options, remult)
      if (!r.valueType && valueType) {
        r.valueType = valueType()
      }
      if (!r.key) {
        r.key = key
      }
      if (!r.dbName) r.dbName = r.key
      let type = r.valueType
      if (!type) {
        type = Reflect.getMetadata('design:type', target, key)
        r.valueType = type
      }
      if (!r.target) r.target = target
      return r
    }
    checkTarget(target)
    let names: columnInfo[] = columnsOfType.get(target.constructor)
    if (!names) {
      names = []
      columnsOfType.set(target.constructor, names)
    }

    let set = names.find((x) => x.key == key)
    if (!set)
      names.push({
        key,
        settings: factory,
      })
    else {
      let prev = set.settings
      set.settings = (c) => {
        let prevO = prev(c)
        let curr = factory(c)
        return Object.assign(prevO, curr)
      }
    }
  }
}

export interface StringFieldOptions<entityType = any>
  extends FieldOptions<entityType, string> {
  maxLength?: number
}
export function checkTarget(target: any) {
  if (!target)
    throw new Error(
      "Set the 'experimentalDecorators:true' option in your 'tsconfig' or 'jsconfig' (target undefined)",
    )
}