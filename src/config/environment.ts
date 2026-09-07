import "dotenv/config";

/**
 * Validate and retrieve a required environment variable.
 * Fails fast if the variable is missing, empty, or contains only whitespace.
 * @param name - The environment variable name
 * @returns The trimmed, non-empty environment variable value
 * @throws Error with a clear message if the variable is not configured correctly
 */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(
      `Missing or empty required environment variable: ${name}\n` +
        `Please set ${name} in your .env file or as an environment variable.`,
    );
  }

  return value.trim();
}

/**
 * Centralized environment configuration module.
 * All environment variables used by the project are defined, validated, and exported here.
 * This is the single source of truth for environment configuration.
 */
export const config = Object.freeze({
  /** Base URL for the application under test. */
  BASE_URL: requireEnv("BASE_URL"),

  /** Email of the empty user account for login tests. */
  EMPTY_USER_EMAIL: requireEnv("EMPTY_USER_EMAIL"),

  /** Password of the empty user account for login tests. */
  EMPTY_USER_PASSWORD: requireEnv("EMPTY_USER_PASSWORD"),

  /** Display name of the empty user account for login tests. */
  EMPTY_USER_DISPLAY_NAME: requireEnv("EMPTY_USER_DISPLAY_NAME"),

  /** Display name for newly created test users. */
  DEFAULT_TEST_USER_DISPLAY_NAME: requireEnv("DEFAULT_TEST_USER_DISPLAY_NAME"),

  /** Password for newly created test users. */
  DEFAULT_TEST_USER_PASSWORD: requireEnv("DEFAULT_TEST_USER_PASSWORD"),

  /** Indicates whether tests are running in a CI environment (GitHub Actions). */
  isCI: Boolean(process.env.CI),
});
