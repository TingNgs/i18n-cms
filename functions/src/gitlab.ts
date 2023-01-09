import express = require('express');
const cors = require('cors');
import axios from 'axios';
import { Gitlab } from '@gitbeaker/node';
import { getAuth } from 'firebase-admin/auth';
const querystring = require('querystring');

const app = express();
app.use(cors({ origin: true }));

app.get(
  '/auth',
  async (request: express.Request, response: express.Response) => {
    const { code, redirectUrl } = request.query;
    const apiPath = `https://${request.get('host')}`;
    const redirect_uri = `${apiPath}/gitlab/auth?redirectUrl=${redirectUrl}`;
    if (!code) {
      const query = querystring.stringify({
        client_id: process.env.GITLAB_CLIENT_ID,
        response_type: 'code',
        redirect_uri,
        redirectUrl
      });
      response.redirect(
        `https://gitlab.com/oauth/authorize?${query}&scope=read_api+read_user+read_repository+write_repository`
      );
      return;
    }

    const { data } = await axios.post(`https://gitlab.com/oauth/token`, null, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'Accept-Encoding': false
      },

      params: {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.GITLAB_CLIENT_ID,
        client_secret: process.env.GITLAB_SECRET,
        redirect_uri
      }
    });

    const gitlab = new Gitlab({
      oauthToken: data.access_token
    });

    const { id } = await gitlab.Users.current();
    const token = await getAuth().createCustomToken(`gitlab:${id}`);
    const query = querystring.stringify({
      provider: 'gitlab',
      code,
      token,
      ...data
    });
    response.redirect(`${redirectUrl}?${query}`);
  }
);

export default app;
