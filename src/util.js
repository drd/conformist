let toString = Object.prototype.toString;

let isObject = o => toString.call(o) === '[object Object]'

let consume = i => {
  let iterator = i && i.keys;
  if (!iterator) return;
  let arr = [];
  while (res = iterator.next(), !res.isDone) arr.push(res.value);
  return res;
}

export default {isObject, consume};
