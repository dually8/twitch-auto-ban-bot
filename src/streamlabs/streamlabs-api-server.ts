import axios from 'axios';
import fastify, { FastifyInstance } from 'fastify';
import { Logger } from '../logger';
import { STREAMLABS_API_BASE } from './streamlabs.types';
import { StreamlabsApiRepo } from './streamlabs-api-repo';

type StreamlabsApiServerParams = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
};

export class StreamlabsApiServer {
    private _clientId = '';
    private _clientSecret = '';
    private _redirectUri = '';

    private readonly server: FastifyInstance;

    constructor(params: StreamlabsApiServerParams) {
        this._clientId = params.clientId;
        this._clientSecret = params.clientSecret;
        this._redirectUri = params.redirectUri;
        this.server = fastify();
    }

    public setup(port = 8080): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.get('/', async (request, reply) => {
                const accessToken = await StreamlabsApiRepo.getStreamlabsAccessToken();
                if (!accessToken) {
                    let auth_url = `${STREAMLABS_API_BASE}/authorize?`;
                    let params = {
                        'client_id': this._clientId,
                        'redirect_uri': this._redirectUri,
                        'response_type': 'code',
                        'scope': 'donations.read+donations.create+alerts.create+alerts.write',
                    };
                    // not encoding params
                    auth_url += Object.keys(params).map(k => `${k}=${params[k]}`).join('&');

                    reply.type('text/html');
                    reply.send(`<a href="${auth_url}">Authorize with Streamlabs!</a>`);
                } else {
                    const response = await axios.get(`${STREAMLABS_API_BASE}/alerts/get_status?access_token=${accessToken}`);
                    const data = response.data;
                    reply.type('text/html');
                    reply.send(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
                }
            });

            this.server.get('/auth', async (request, reply) => {
                const { query } = request;
                const { code } = query as any;
                const body = {
                    'grant_type': 'authorization_code',
                    'client_id': this._clientId,
                    'client_secret': this._clientSecret,
                    'redirect_uri': this._redirectUri,
                    'code': code
                };
                const response = await axios.post(`${STREAMLABS_API_BASE}/token?`, body);

                const { data } = response;
                if (data && data.access_token && data.refresh_token) {
                    await StreamlabsApiRepo.setStreamlabsTokens(data.access_token, data.refresh_token);
                }
                reply.redirect('/');
            });

            this.server.listen(port, (err, address) => {
                if (err) {
                    Logger.logError(`Error starting fastify server: ${err.message}`);
                    Logger.logError({err});
                    this.server.log.error(err);
                    reject(err);
                    process.exit(1);
                }
                Logger.logInfo(`Server listening at ${address}`);
                resolve();
            });
        });
    }
}