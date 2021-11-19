/*
 * @Author: aXi
 * @Date: 2021-11-19 13:13:42
 * @Last Modified by: aXi
 * @Last Modified time: 2021-11-19 14:11:55
 */


/**
 * TS 泛型
 * 个人理解就是类似函数的传参 把对应的类型传入使用
 */

// 基本操作
function setName<Type>(params: Type): Type {
  return params
}

// 类型简单的情况下
// 注明 泛型的类型 => 不推荐
// let getName = setName<string>('aXi')

// 常用类型推导
let getName = setName<string>('aXi')

// 泛型数组
function getGoodsList<GoodsList>(params: GoodsList[]): GoodsList[] {
  console.log('%c params.length ', 'background-image:color:transparent;color:red;');
  console.log('🚀~ => ', params.length); // 类型“Type”上不存在属性“length”。
  return params
}
type GoodsList = { name: string, length: 1 }
let goods: GoodsList = { name: '尺子', length: 1 }
let goodsList = getGoodsList<GoodsList>([goods])

// 函数表达式方式
function identity(params) {
  return params
}
// 基本操作 不清晰
// let myIdentity: <Type>(params: Type) => Type = identity

// 对象文本类型形式
// let myIdentity: { <Type>(params: Type): Type } = identity;

// 接口形式 推荐
interface GenericIdentityFn<Type> {
  (params: Type): Type;
}

let myIdentity: GenericIdentityFn<GoodsList> = identity;

let res = myIdentity(goods)

// 泛型class通用类
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};

// 泛型通用约束
interface Lengthwise {
  length: number
}
// 通过 extends 关键字来进行对泛型类型的继承
function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length);
  return arg;
}

// let loggingId = loggingIdentity(3) // 类型“number”的参数不能赋给类型“Lengthwise”的参数


// 在泛型约束中使用类型参数
// interface GetPropertyFn<Type, Key extends keyof Type> {
//   (obj: Type, key: Key)
// }

// function getProperty(obj, key) {
//   return obj[key];
// }

// let x = { a: 1, b: 2, c: 3, d: 4 };
// type key = 'a' | 'b'

// let myGetProperty: GetPropertyFn<object, key> = getProperty

// myGetProperty(x, "a");
// myGetProperty(x, "m");


function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a");
getProperty(x, "m");
