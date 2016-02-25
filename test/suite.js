var Mocha = require('mocha');

var mocha = new Mocha();

var files = [
    'test.js',
    'packages/conformist-validation/test.js',
    'packages/conformist-schema/test.js'
];

files.forEach(file => mocha.addFile(file));

mocha.run();
