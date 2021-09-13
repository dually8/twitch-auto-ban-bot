export interface IChatClient {
    isConnected: boolean;
    setup(): Promise<void>;
    say(channel: string, msg: string): Promise<void>;
    ban(user: string, channel: string, reason?: string): void;
}