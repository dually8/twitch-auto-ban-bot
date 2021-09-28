export type BaseResponse = {
    success: boolean;
}

export type GetAlertStatusResponse = {
    paused: boolean;
}

export type SendTestAlertResponse = BaseResponse;

export type PauseAlertQueueResponse = BaseResponse;

export type UnpauseAlertQueueResponse = BaseResponse;

export type SkipAlertResponse = BaseResponse;

export type TestAlertType = 'follow' | 'subscription' | 'donation' | 'host' | 'bits' | 'raid';

export const STREAMLABS_API_BASE = 'https://streamlabs.com/api/v1.0';