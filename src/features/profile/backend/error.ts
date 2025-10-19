export const profileErrorCodes = {
  notFound: 'PROFILE_NOT_FOUND',
  fetchError: 'PROFILE_FETCH_ERROR',
  updateFailed: 'PROFILE_UPDATE_FAILED',
  validationError: 'PROFILE_VALIDATION_ERROR',
  unauthorized: 'PROFILE_UNAUTHORIZED',
} as const;

export type ProfileServiceError = typeof profileErrorCodes[keyof typeof profileErrorCodes];
