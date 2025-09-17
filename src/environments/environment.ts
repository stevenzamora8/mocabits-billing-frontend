export const environment = {
  production: false,
  // API base URL used by the frontend. Change this per environment if needed.
  apiBaseUrl: 'http://3.15.163.40:8080',
  // Optional: a pre-encoded Basic auth value (either with or without the "Basic " prefix).
  // If provided, AuthService will use this when no explicit credentials are passed to login().
  basicAuth: ''
  ,
  // Optional client credentials that can be used by the login form as defaults.
  clientId: '',
  clientSecret: ''
};
