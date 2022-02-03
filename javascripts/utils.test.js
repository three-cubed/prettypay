const {
    generateUUID,
    formatNumberToString
} = require('./utils.js');

describe('testing some util.js functions', () => {
    test('differing UUIDs being created by generateUUID()', () => {
        const UUIDno1 = generateUUID();
        const UUIDno2 = generateUUID();
        expect(UUIDno1).not.toEqual(UUIDno2); // not.toEqual is the correct use for comparing two strings
    });
    test('formatNumberToString(123) returns a string', () => {
        const string = formatNumberToString(123)
        expect(typeof string).toBe('string')
    });
    test('formatNumberToString(12.23) returns a string', () => {
        const string = formatNumberToString(12.23)
        expect(typeof string).toBe('string')
    });
    test("formatNumberToString('12.23') returns the string '12.23'", () => {
        const string = formatNumberToString('12.23')
        expect(string).toBe('12.23')
    });
    test("formatNumberToString('12.2') returns the string '12.20'", () => {
        const string = formatNumberToString('12.2')
        expect(string).toBe('12.20')
    });
    test("formatNumberToString('12.234') returns the string '12.23'", () => {
        const string = formatNumberToString('12.234')
        expect(string).toBe('12.23')
    });
});
