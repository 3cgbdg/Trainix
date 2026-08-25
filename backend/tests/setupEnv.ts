process.env.JWT_SECRET ??= "trainix-test-secret";

// Starting an in-memory MongoDB can take longer on cold CI/Windows machines.
// The pretest script downloads the binary once; this timeout covers process startup.
jest.setTimeout(30_000);
