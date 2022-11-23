import admin from 'firebase-admin';
import { defineConfig } from 'cypress';
import { plugin as cypressFirebasePlugin } from 'cypress-firebase';
import coverage from '@cypress/code-coverage/task';

export default defineConfig({
  projectId: 'd1wov5',
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,

  e2e: {
    baseUrl: 'http://localhost:3000',
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      cypressFirebasePlugin(on, config, admin);
      coverage(on, config);
      return config;
    }
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    }
  }
});
