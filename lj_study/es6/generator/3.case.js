function  * gen() {
    let a = yield 1;
    yield a; 
}
const res = gen()
console.log(res.next());
console.log(res.next(100));