const toString = Object.prototype.toString;

const isObject = o => toString.call(o) === '[object Object]'

export default {isObject,};
