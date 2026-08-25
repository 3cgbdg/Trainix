// Regression test for the JWT_SECRET fail-fast startup guard in app.ts. Every other
// test file relies on tests/setupEnv.ts having already set JWT_SECRET before any
// module is imported, so this is deliberately isolated in its own file/module
// registry and restores the env var immediately after each assertion.
describe("app startup", () => {
    const originalSecret = process.env.JWT_SECRET;

    afterEach(() => {
        process.env.JWT_SECRET = originalSecret;
        jest.resetModules();
    });

    it("throws at import time if JWT_SECRET is unset, instead of starting and failing per-request", () => {
        delete process.env.JWT_SECRET;
        jest.resetModules();
        expect(() => require("../app")).toThrow(/JWT_SECRET/);
    });

    it("starts normally once JWT_SECRET is restored", () => {
        process.env.JWT_SECRET = originalSecret;
        jest.resetModules();
        expect(() => require("../app")).not.toThrow();
    });
});
