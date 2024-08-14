const { existsSync } = require('fs');

module.exports = ({ config }) => {
  const localGoogleServicesFile = './google-services.json';
  const googleServicesFile = existsSync(localGoogleServicesFile)
    ? localGoogleServicesFile
    : process.env.google_services;

  return {
    ...config, // Spread the existing configuration
    android: {
      ...config.android, // Spread the existing android configuration
      googleServicesFile, // Override or add googleServicesFile
    },
  };
};