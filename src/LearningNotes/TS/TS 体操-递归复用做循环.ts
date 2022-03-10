
type ttt = Promise<Promise<Promise<Record<string, any>>>>;

type DeepPromiseValueType<P extends Promise<unknown>> = P extends Promise<infer ValueType> ?
  ValueType extends Promise<unknown> ?
  DeepPromiseValueType<ValueType> : ValueType
  : never

type DeepPromiseValueTypeResult = DeepPromiseValueType<ttt>

type DeepPromiseValueType2<T> = T extends Promise<infer ValueType> ? DeepPromiseValueType2<ValueType> : T

type DeepPromiseValueType2Result = DeepPromiseValueType2<ttt>


type arr = [5, 4, 3, 2, 1];


type ReverseArr<T> = T extends [infer One, infer Two, infer Three, infer Four, infer Five] ? [Five, Four, Three, Two, One] : never
type ReverseArrResult = ReverseArr<'abc'>

type ReverseArr2<T> = T extends [infer First, ...infer Other] ? [ReverseArr2<Other>, First] : T

type ReverseArr2Result = ReverseArr<arr>


type Includes<Arr extends unknown[], FindItem> = Arr extends [infer First, ...infer Other] ?
  IsEqual<FindItem, First> extends true ? true : Includes<Other, FindItem> : false

type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false);

type IncludesResult = Includes<arr, 4>

type RemoveItem<Arr extends unknown[], Item, Result extends unknown[] = []> =
  Arr extends [infer First, ...infer Rest] ?
  IsEqual<First, Item> extends true ?
  RemoveItem<Rest, Item, Result> : RemoveItem<Rest, Item, [First, ...Rest]> : Result

type BuildArray<Length extends number, Ele = unknown, Arr extends unknown[] = []> =
  Arr['length'] extends Length ? Arr : BuildArray<Length, Ele, [...Arr, Ele]>

type BuildArrayResult = BuildArray<5>


type ReplaceAll<Str extends string, From extends string, To extends string> =
  Str extends `${infer Prefix}${From}${infer Suffix}` ? `${Prefix}${To}${ReplaceAll<Suffix, From, To>}` : Str

type StringToUnion<Str extends string> = Str extends `${infer One}${infer Two}${infer Three}${infer Four}` ? `${One}|${Two}|${Three}|${Four}` : Str
type StringToUnionResult = StringToUnion<'body'>

type ReverseStr<Str extends string, Result extends string = ''> = Str extends `${infer Left}${infer Right}` ? ReverseStr<Right, `${Left}${Result}`> : Result
type ReverseStrResult = ReverseStr<'hello'>
