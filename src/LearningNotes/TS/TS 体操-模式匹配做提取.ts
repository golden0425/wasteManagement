// 类型体操套路一： 模式匹配做提取

// Promise:
type GetValueType<P> = P extends Promise<infer Value> ? Value : never

type GetValueResult = GetValueType<Promise<'guang'>>

// 数组：

// GetFirst
type GetFirst<Arr extends unknown[]> = Arr extends [infer First, ...unknown[]] ? First : never

type GetFirstResult = GetFirst<[1, 2, 3]>
type GetFirstResult2 = GetFirst<[]>

// GetLast
type GetLast<Arr extends unknown[]> = Arr extends [...unknown[], infer Last] ? Last : never

type GetLastResult = GetLast<[1, 2, 3]>
type GetLastResult2 = GetLast<[]>

// PopArr
type PopArr<Arr extends unknown[]> = Arr extends [] ? [] : Arr extends [...infer Rest, unknown] ? Rest : never

type PopResult = PopArr<[1, 2, 3]>
type PopResult2 = PopArr<[]>

// ShiftArr
type ShiftArr<Arr extends unknown[]> = Arr extends [] ? [] : Arr extends [unknown, ...infer Rest] ? Rest : never

type ShiftResult = ShiftArr<[1, 2, 3]>
type ShiftResult2 = ShiftArr<[]>

// 字符串：

// StartsWith:
type StartsWith<Str extends string, Prefix extends string> = Str extends `${Prefix}${string}` ? true : false

type StartsWithResult = StartsWith<'guang and dong', 'guang'>
type StartsWithResult2 = StartsWith<'guang and dong', 'dong'>

// Replace:
type ReplaceStr<Str extends string, From extends string, To extends string> = Str extends `${infer Prefix}${From}${infer Suffix}` ? `${Prefix}${To}${Suffix}` : Str

type ReplaceResult = ReplaceStr<'Guangguang\'s best friend is ?', '?', 'Dongdong'>
type ReplaceResult2 = ReplaceStr<'abc', '?', 'Dongdong'>

// Trim:
type TrimStrRight<Str extends string> = Str extends `${infer Rest}${' ' | '\n' | '\t'}` ? TrimStrRight<Rest> : Str

type TrimRightResult = TrimStrRight<'guang        '>

type TrimStrLeft<Str extends string> = Str extends `${' ' | '\n' | '\t'}${infer Rest}` ? TrimStrLeft<Rest> : Str

type TrimLeftResult = TrimStrLeft<'      dong'>

type TrimStr<Str extends string> = TrimStrRight<TrimStrLeft<Str>>

type TrimResult = TrimStr<'      dong   '>

// 函数：

// GetParameters
type GetParameters<Func extends Function> = Func extends (...args: infer Args) => unknown ? Args : never

type ParametersResult = GetParameters<(name: string, age: number) => string>
type ParametersResult2 = GetParameters<() => string>

// GetReturnType
type GetReturnType<Func extends Function> = Func extends (...args: unknown[]) => infer ReturnType ? ReturnType : never

type ReturnTypeResullt = GetReturnType<() => 'dong'>
