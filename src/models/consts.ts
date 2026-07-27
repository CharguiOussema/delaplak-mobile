// Mirrors delaplak-server/src/types/consts.ts (the pieces relevant to the mobile client).
// There is no shared package between the backend and this app — keep both in sync by hand.

export enum STATUS_CODE {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
  UNAUTHORIZED = 401,
  DUPLICATED = 409,
  FORBIDDEN = 403,
  GONE = 410,
  EXPIRED = 498,
  NOT_ALLOWED = 405,
  LOCKED = 423,
}

export enum USER_ROLES {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export enum LANGUAGES {
  en = 'en',
  fr = 'fr',
  ar = 'ar',
}

export enum ORDER_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum APP_ACCESS {
  NO_ACCESS = 'NO_ACCESS',
  READ = 'READ',
  WRITE = 'WRITE',
}
