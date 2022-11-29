import axios from 'axios';
import { Bitbucket } from 'bitbucket';
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp({
  serviceAccountId: process.env.SERVICE_ACCOUNT_ID
});

export const bitbucket = functions.https.onRequest(
  async (request, response) => {
    const { code } = request.query;
    const {
      data: { access_token }
    } = await axios.post(
      'https://bitbucket.org/site/oauth2/access_token',
      `grant_type=authorization_code&code=${code}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: process.env.BITBUCKET_KEY || '',
          password: process.env.BITBUCKET_SECRET || ''
        }
      }
    );
    const bitbucket = new Bitbucket({ auth: { token: access_token } });
    const {
      data: { uuid }
    } = await bitbucket.users.getAuthedUser({});
    const token = await getAuth().createCustomToken(`bitbucket:${uuid}`);
    response.set('Access-Control-Allow-Origin', '*');
    response.send({ token, access_token });
  }
);
