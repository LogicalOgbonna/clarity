interface OAuthServiceProps {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
  state?: string;
  baseUrl: string;
}

interface OAuthServiceResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface OAuthServiceUserInfo {
  id: string;
  name: string;
  email: string;
}

abstract class OAuthService implements OAuthServiceProps {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
  state?: string;
  baseUrl: string;
  constructor({clientId, clientSecret, redirectUri, code, state, baseUrl}: OAuthServiceProps) {
    if (!clientId || !clientSecret || !redirectUri || !code || !baseUrl) {
      throw new Error('Missing required properties');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.code = code;
    this.state = state || '';
    this.baseUrl = baseUrl;
  }

  abstract getOAuthUrl(state: string): string;

  abstract getOAuthAccessToken<T>(code: string): Promise<T>;

  abstract getOAuthUserInfo<T>(accessToken: string): Promise<T>;
}

export default OAuthService;
