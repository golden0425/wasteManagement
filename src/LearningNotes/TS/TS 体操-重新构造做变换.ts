// 数组：

// Push
type Push<Arr extends  unknown[], Ele> = [...Arr, Ele];

type PushResult = Push<[1, 2, 3], 4>;

// Unshift
type Unshift<Arr extends  unknown[], Ele> = [Ele, ...Arr];

type UnshiftResult = Unshift<[1, 2, 3], 0>;

// Zip
type Zip<One extends [unknown, unknown], Other extends [unknown, unknown]> =
    One extends [infer OneFirst, infer OneSecond]
        ? Other extends [infer OtherFirst, infer OtherSecond]
            ? [[OneFirst, OtherFirst], [OneSecond, OtherSecond]] :[]
                : [];


type ZipResult = Zip<[1,2], ['guang', 'dong']>;

// Zip2
type Zip2<One extends unknown[], Other extends unknown[]> =
    One extends [infer OneFirst, ...infer OneRest]
        ? Other extends [infer OtherFirst, ...infer OtherRest]
            ? [[OneFirst, OtherFirst], ...Zip2<OneRest, OtherRest>]: []
                : [];

type Zip2Result = Zip2<[1,2,3,4,5], ['guang', 'dong', 'is', 'best', 'friend']>;

// 字符串：

// CapitalizeStr
type CapitalizeStr<Str extends string> = Str extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : Str;

type CapitalizeResult = CapitalizeStr<'guang'>;

// CamelCase
type CamelCase<Str extends string> =
    Str extends `${infer Left}_${infer Right}${infer Rest}`
        ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
        : Str;

type CamelCaseResult = CamelCase<'dong_dong_dong'>;

// DropSubStr
type DropSubStr<Str extends string, SubStr extends string> =
    Str extends `${infer Prefix}${SubStr}${infer Suffix}`
        ? DropSubStr<`${Prefix}${Suffix}`, SubStr> : Str;

type DropResult = DropSubStr<'dong~~~', '~'>;

// 函数

// AppendArgument
type AppendArgument<Func extends Function, Arg> =
    Func extends (...args: infer Args) => infer ReturnType
        ? (...args: [...Args, Arg]) => ReturnType : never;

type AppendArgumentResult  = AppendArgument<(name: string) => boolean, number>;

// 索引类型

// Mapping
type Mapping<Obj extends object> = {
    [Key in keyof Obj]: [Obj[Key], Obj[Key], Obj[Key]]
}

type res = Mapping<{ a: 1, b: 2}>;

// UppercaseKey
type UppercaseKey<Obj extends object> = {
    [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key]
}

type UppercaseKeyResult = UppercaseKey<{ guang: 1, dong: 2}>;

// ToReadonly
type ToReadonly<T> =  {
    readonly [Key in keyof T]: T[Key];
}

type ReadonlyResult = ToReadonly<{
    name: string;
    age: number;
}>;

// ToPartial
type ToPartial<T> = {
    [Key in keyof T]?: T[Key]
}

type PartialResult = ToPartial<{
    name: string;
    age: number;
}>;

// ToMutable
type ToMutable<T> = {
    -readonly [Key in keyof T]: T[Key]
}

type MutableResult =  ToMutable<{
    readonly name: string;
    age: number;
}>;

// ToRequired
type ToRequired<T> = {
    [Key in keyof T]-?: T[Key]
}

type RequiredResullt = ToRequired<{
    name?: string;
    age: number;
}>;

// FilterByValueType
type FilterByValueType<Obj extends Record<string, any>, ValueType> = {
    [Key in keyof Obj
        as ValueType extends Obj[Key] ? Key : never]
        : Obj[Key]
}

interface Person {
    name: string;
    age: number;
    hobby: string[];
}

type FilterResult = FilterByValueType<Person, string | number>;
