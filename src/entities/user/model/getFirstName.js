export const getFirstName = (profile, user) => {
  const name = profile?.fullName || user?.displayName || user?.email || '';
  return name.trim().split(/\s+/)[0] || 'voce';
};
