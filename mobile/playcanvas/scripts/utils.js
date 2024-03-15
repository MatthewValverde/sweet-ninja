var Utils = pc.createScript('utils');

var randomInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var randomFloat = function (min, max) {
    return Math.random() * (max - min) + min;
};
