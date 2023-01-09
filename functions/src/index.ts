import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import bitbucketApp from './bitbucket';
import gitlabApp from './gitlab';

initializeApp({
  serviceAccountId: process.env.SERVICE_ACCOUNT_ID
});

export const bitbucket = functions.https.onRequest(bitbucketApp);
export const gitlab = functions.https.onRequest(gitlabApp);
