import { ClassType } from '../classType';
import { FieldMetadata, FieldOptions, ValueConverter } from './column-interfaces';
import { Filter } from './filter/filter-interfaces';
import { EntityFilter, FindOptions, idType, Repository, RepositoryImplementation } from './remult3';
export declare function makeTitle(name: string): string;
export declare class CompoundIdField implements FieldMetadata<string> {
    fields: FieldMetadata[];
    constructor(...columns: FieldMetadata[]);
    apiUpdateAllowed(item: any): boolean;
    displayValue(item: any): string;
    includedInApi: boolean;
    toInput(value: string, inputType?: string): string;
    fromInput(inputValue: string, inputType?: string): string;
    getDbName(): Promise<string>;
    getId(instance: any): string;
    options: FieldOptions<any, any>;
    get valueConverter(): Required<ValueConverter<string>>;
    target: ClassType<any>;
    readonly: true;
    allowNull: boolean;
    dbReadOnly: boolean;
    isServerExpression: boolean;
    key: string;
    caption: string;
    inputType: string;
    dbName: string;
    valueType: any;
    isEqualTo(value: FieldMetadata<string> | string): EntityFilter<any>;
    resultIdFilter(id: string, data: any): Filter;
}
export declare class LookupColumn<T> {
    private repository;
    id: idType<T>;
    toJson(): any;
    setId(val: any): void;
    waitLoadOf(id: any): Promise<T>;
    get(id: any): any;
    storedItem: {
        item: T;
    };
    set(item: T): void;
    constructor(repository: RepositoryImplementation<T>, id: idType<T>);
    get item(): T;
    waitLoad(): Promise<T>;
}
export declare class OneToMany<T> {
    private provider;
    private settings?;
    constructor(provider: Repository<T>, settings?: {
        create?: (newItem: T) => void;
    } & FindOptions<T>);
    private _items;
    private _currentPromise;
    get lazyItems(): T[];
    load(): Promise<T[]>;
    private find;
    create(item?: Partial<T>): T;
}
