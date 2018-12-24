"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function spacing() {
    return function (target, propertyKey, descriptor) {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }
        const method = descriptor.value;
        descriptor.value = async function () {
            console.log('');
            const result = await method.apply(this, arguments);
            console.log('');
            return result;
        };
        return descriptor;
    };
}
exports.spacing = spacing;
