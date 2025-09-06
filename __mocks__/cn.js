// Mock for the cn utility function
module.exports = {
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
};