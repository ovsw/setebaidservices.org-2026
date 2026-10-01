export type CallDirectors = {
  href: string;
  label: string;
  phone: string;
  portrait: string;
};

/**
 * The fixed "call the directors" action in the header, the mobile menu and
 * the FAQ hub. Unset until the Setebaid number and names are confirmed;
 * while it is null those places show no call action.
 */
export const CALL_DIRECTORS: CallDirectors | null = null;
