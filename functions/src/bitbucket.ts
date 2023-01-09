import express = require('express');
const cors = require('cors');
import axios from 'axios';
import { Bitbucket } from 'bitbucket';
import { getAuth } from 'firebase-admin/auth';
const querystring = require('querystring');

const app = express();
app.use(cors({ origin: true }));

app.post(
  '/refresh',
  async (request: express.Request, response: express.Response) => {
    const { refreshToken } = request.body;

    const { data } = await axios.post(
      `https://bitbucket.org/site/oauth2/access_token`,
      `grant_type=refresh_token&refresh_token=${refreshToken}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: process.env.BITBUCKET_CLIENT_ID || '',
          password: process.env.BITBUCKET_SECRET || ''
        }
      }
    );
    response.set('Access-Control-Allow-Origin', '*');
    response.send(data);
  }
);

app.get(
  '/auth',
  async (request: express.Request, response: express.Response) => {
    const { code, redirectUrl } = request.query;
    const apiPath = `https://${request.get('host')}`;
    const redirect_uri = `${apiPath}/bitbucket/auth?redirectUrl=${redirectUrl}`;
    if (!code) {
      const query = querystring.stringify({
        client_id: process.env.BITBUCKET_CLIENT_ID,
        response_type: 'code',
        redirect_uri,
        redirectUrl
      });
      response.redirect(`https://bitbucket.org/site/oauth2/authorize?${query}`);
      return;
    }

    const { data } = await axios.post(
      `https://bitbucket.org/site/oauth2/access_token`,
      `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: process.env.BITBUCKET_CLIENT_ID || '',
          password: process.env.BITBUCKET_SECRET || ''
        }
      }
    );
    const bitbucket = new Bitbucket({ auth: { token: data.access_token } });
    const {
      data: { uuid }
    } = await bitbucket.users.getAuthedUser({});
    const token = await getAuth().createCustomToken(`bitbucket:${uuid}`);
    const query = querystring.stringify({
      provider: 'bitbucket',
      code,
      token,
      ...data
    });
    response.redirect(`${redirectUrl}?${query}`);
  }
);

export default app;
