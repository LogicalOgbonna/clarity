export type ErrorType = 'bad_request' | 'unauthorized' | 'forbidden' | 'not_found' | 'rate_limit' | 'offline';

export type Surface = 'chat' | 'auth' | 'api' | 'database' | 'history' | 'user' | 'summary';

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = 'response' | 'log' | 'none';

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  database: 'log',
  chat: 'response',
  auth: 'response',
  api: 'response',
  history: 'response',
  user: 'response',
  summary: 'response',
};

export class CoreError extends Error {
  public type: ErrorType;
  public surface: Surface;
  public statusCode: number;

  constructor(errorCode: ErrorCode, cause?: string, defaultMessage?: string) {
    super();

    const [type, surface] = errorCode.split(':');

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode, defaultMessage);
    this.statusCode = getStatusCodeByType(this.type);
  }

  public toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const {message, cause, statusCode} = this;

    if (visibility === 'log') {
      console.error({
        code,
        message,
        cause,
      });

      return {code: '', message: 'Something went wrong. Please try again later.', statusCode};
    }

    return {code, message, cause, statusCode};
  }
}

export function getMessageByErrorCode(errorCode: ErrorCode, defaultMessage?: string): string {
  if (errorCode.includes('database')) {
    return 'An error occurred while executing a database query.';
  }

  switch (errorCode) {
    case 'bad_request:api':
      return defaultMessage ?? "The request couldn't be processed. Please check your input and try again.";

    case 'unauthorized:auth':
      return defaultMessage ?? 'You need to sign in before continuing.';
    case 'forbidden:auth':
      return defaultMessage ?? 'Your account does not have access to this feature.';

    case 'rate_limit:chat':
      return defaultMessage ?? 'You have exceeded your maximum number of messages for the day. Please try again later.';
    case 'not_found:chat':
      return defaultMessage ?? 'The requested chat was not found. Please check the chat ID and try again.';
    case 'forbidden:chat':
      return defaultMessage ?? 'This chat belongs to another user. Please check the chat ID and try again.';
    case 'unauthorized:chat':
      return defaultMessage ?? 'You need to sign in to view this chat. Please sign in and try again.';
    case 'offline:chat':
      return (
        defaultMessage ??
        "We're having trouble sending your message. Please check your internet connection and try again."
      );

    case 'not_found:summary':
      return defaultMessage ?? 'The requested summary was not found. Please check the summary ID and try again.';
    case 'forbidden:summary':
      return defaultMessage ?? 'This summary belongs to another user. Please check the summary ID and try again.';
    case 'unauthorized:summary':
      return defaultMessage ?? 'You need to sign in to view this summary. Please sign in and try again.';
    case 'bad_request:summary':
      return defaultMessage ?? 'The request to create or update the summary was invalid. Please check your input and try again.';

    default:
      return defaultMessage ?? 'Something went wrong. Please try again later.';
  }
}

function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case 'bad_request':
      return 400;
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'not_found':
      return 404;
    case 'rate_limit':
      return 429;
    case 'offline':
      return 503;
    default:
      return 500;
  }
}
