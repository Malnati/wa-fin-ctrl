// api/src/auth/constants/auth.constants.ts

// Environment variable utility function for Node.js projects
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is not defined. ` +
        `Please ensure this variable is properly configured in your docker-compose.yml file. ` +
        `For development, you can use 'docker-compose up' or set up your local environment ` +
        `according to the env.example file.`,
    );
  }
  return value;
}

export const JWT_SECRET_MOCK = getEnvVar('JWT_SECRET_MOCK');
export const TOKEN_EXPIRATION_SECONDS = Number(
  getEnvVar('TOKEN_EXPIRATION_SECONDS'),
);

// User constants
export const DEMO_USER_EMAIL = getEnvVar('DEMO_USER_EMAIL');
export const DEMO_USER_NAME = getEnvVar('DEMO_USER_NAME');
export const DEMO_USER_PICTURE = getEnvVar('DEMO_USER_PICTURE');
export const ADMIN_USER_EMAIL = getEnvVar('ADMIN_USER_EMAIL');
export const ADMIN_USER_NAME = getEnvVar('ADMIN_USER_NAME');
export const ADMIN_USER_PICTURE = getEnvVar('ADMIN_USER_PICTURE');
export const TEST_USER_EMAIL = getEnvVar('TEST_USER_EMAIL');
export const TEST_USER_NAME = getEnvVar('TEST_USER_NAME');
export const TEST_USER_PICTURE = getEnvVar('TEST_USER_PICTURE');

export const MOCK_USERS = [
  {
    id: 'usr_demo_001',
    email: DEMO_USER_EMAIL,
    name: DEMO_USER_NAME,
    picture: DEMO_USER_PICTURE,
    email_verified: true,
  },
  {
    id: 'usr_admin_001',
    email: ADMIN_USER_EMAIL,
    name: ADMIN_USER_NAME,
    picture: ADMIN_USER_PICTURE,
    email_verified: true,
  },
  {
    id: 'usr_test_001',
    email: TEST_USER_EMAIL,
    name: TEST_USER_NAME,
    picture: TEST_USER_PICTURE,
    email_verified: true,
  },
];

export const MOCK_USERS_COUNT = MOCK_USERS.length;
