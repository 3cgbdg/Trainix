import nextJest from 'next/jest';
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
    testPathIgnorePatterns: [
        "<rootDir>/tests/e2e/"
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },

};

module.exports = createJestConfig(customJestConfig);
