import {
    validateString,
    validateBoolean,
    validateStringArray,
    validateArrayIndex
} from '../utils/validation-utils.js';

describe('Validation Utilities', () => {
    describe('validateString', () => {
        it('should not throw for valid string input', () => {
            expect(() => validateString('test', 'paramName')).not.toThrow();
        });

        it('should throw for non-string input', () => {
            const invalidInputs = [123, true, [], {}, null, undefined];
            invalidInputs.forEach(input => {
                expect(() => validateString(input, 'paramName')).toThrow('paramName must be a string');
            });
        });
    });

    describe('validateBoolean', () => {
        it('should not throw for valid boolean input', () => {
            expect(() => validateBoolean(true, 'paramName')).not.toThrow();
            expect(() => validateBoolean(false, 'paramName')).not.toThrow();
        });

        it('should throw for non-boolean input', () => {
            const invalidInputs = ['true', 1, [], {}, null, undefined];
            invalidInputs.forEach(input => {
                expect(() => validateBoolean(input, 'paramName')).toThrow('paramName must be a boolean');
            });
        });
    });

    describe('validateStringArray', () => {
        it('should not throw for valid string array input', () => {
            expect(() => validateStringArray(['test'], 'paramName')).not.toThrow();
            expect(() => validateStringArray([], 'paramName')).not.toThrow();
        });

        it('should throw for non-array input', () => {
            const invalidInputs = ['test', 123, true, {}, null, undefined];
            invalidInputs.forEach(input => {
                expect(() => validateStringArray(input, 'paramName')).toThrow('paramName must be an array');
            });
        });

        it('should throw for array with non-string elements', () => {
            const invalidArrays = [[123], [true], [[]], [{}], [null], [undefined]];
            invalidArrays.forEach(array => {
                expect(() => validateStringArray(array, 'paramName')).toThrow('paramName must contain only strings');
            });
        });
    });

    describe('validateArrayIndex', () => {
        it('should not throw for valid array index', () => {
            expect(() => validateArrayIndex(0, 'paramName', 1)).not.toThrow();
            expect(() => validateArrayIndex(1, 'paramName', 2)).not.toThrow();
        });

        it('should throw for non-integer input', () => {
            const invalidInputs = [1.5, '1', true, [], {}, null, undefined];
            invalidInputs.forEach(input => {
                expect(() => validateArrayIndex(input, 'paramName', 2)).toThrow('paramName must be an integer');
            });
        });

        it('should throw for negative index', () => {
            expect(() => validateArrayIndex(-1, 'paramName', 2)).toThrow('paramName must be non-negative');
        });

        it('should throw for index >= array length', () => {
            expect(() => validateArrayIndex(2, 'paramName', 2)).toThrow('paramName must be less than array length 2');
        });
    });
}); 