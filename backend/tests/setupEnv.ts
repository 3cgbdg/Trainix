process.env.JWT_SECRET ??= "trainix-test-secret";
// the AI client refuses to build a request without this, so tests that mock the
// transport still need a syntactically valid service URL configured
process.env.PYTHON_API_URL ??= "http://ai.test.local";

// Starting an in-memory MongoDB can take longer on cold CI/Windows machines.
// The pretest script downloads the binary once; this timeout covers process startup.
jest.setTimeout(30_000);
