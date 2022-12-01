import express = require('express');
const cors = require('cors');
import axios from 'axios';
import { Bitbucket } from 'bitbucket';
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
initializeApp({
  serviceAccountId: process.env.SERVICE_ACCOUNT_ID
});
const app = express();
app.use(cors({ origin: true }));

app.post('/', async (request: express.Request, response: express.Response) => {
  const { code } = request.body;
  const { data } = await axios.post(
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
  const bitbucket = new Bitbucket({ auth: { token: data.access_token } });
  const {
    data: { uuid }
  } = await bitbucket.users.getAuthedUser({});
  const token = await getAuth().createCustomToken(`bitbucket:${uuid}`);
  response.set('Access-Control-Allow-Origin', '*');
  response.send({ ...data, token });
});

export const bitbucket = functions.https.onRequest(app);
