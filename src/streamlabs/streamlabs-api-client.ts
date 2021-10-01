import axios from 'axios';
import { StreamlabsApiServer } from './streamlabs-api-server';
import { Logger } from '../logger';
import {
    GetAlertStatusResponse,
    PauseAlertQueueResponse,
    SendTestAlertResponse,
    SkipAlertResponse,
    STREAMLABS_API_BASE,
    TestAlertType,
    UnpauseAlertQueueResponse,
} from './streamlabs.types';
import { StreamlabsApiRepo } from './streamlabs-api-repo';

export class StreamlabsApiClient {

    constructor(
        private readonly apiServer: StreamlabsApiServer
    ) { }

    public async getAlertStatus(): Promise<GetAlertStatusResponse> {
        try {
            const accessToken = await StreamlabsApiRepo.getAccessToken();
            const response = await axios.get(`${STREAMLABS_API_BASE}/alerts/get_status`, {
                params: {
                    "access_token": accessToken,
                }
            });
            return response.data as GetAlertStatusResponse;
        } catch (err) {
            Logger.getInstance().log.error({
                getAlertStatusError: err,
            });
        }
    }

    public async pauseAlerts(): Promise<PauseAlertQueueResponse> {
        try {
            const accessToken = await StreamlabsApiRepo.getAccessToken();
            const response = await axios.post(`${STREAMLABS_API_BASE}/alerts/pause_queue`, {
                "access_token": accessToken,
            });
            return response.data as PauseAlertQueueResponse;
        } catch (err) {
            Logger.getInstance().log.error({
                pauseAlertsError: err,
            });
        }
    }

    public async unpauseAlerts(): Promise<PauseAlertQueueResponse> {
        try {
            const accessToken = await StreamlabsApiRepo.getAccessToken();
            const response = await axios.post(`${STREAMLABS_API_BASE}/alerts/unpause_queue`, {
                "access_token": accessToken,
            });
            return response.data as UnpauseAlertQueueResponse;
        } catch (err) {
            Logger.getInstance().log.error({
                unpauseAlertsError: err,
            });
        }
    }

    public async skipAlert(): Promise<SkipAlertResponse> {
        try {
            const accessToken = await StreamlabsApiRepo.getAccessToken();
            const response = await axios.post(`${STREAMLABS_API_BASE}/alerts/skip`, {
                "access_token": accessToken,
            });
            return response.data as SkipAlertResponse;
        } catch (err) {
            Logger.getInstance().log.error({
                skipAlertError: err,
            });
        }
    }

    public async sendTestAlert(type: TestAlertType = 'donation'): Promise<SendTestAlertResponse> {
        try {
            const accessToken = await StreamlabsApiRepo.getAccessToken();
            const response = await axios.post(`${STREAMLABS_API_BASE}/alerts/send_test_alert`, {
                "access_token": accessToken,
            });
            return response.data as UnpauseAlertQueueResponse;
        } catch (err) {
            Logger.getInstance().log.error({
                sendTestAlertError: err,
            });
        }
    }
}