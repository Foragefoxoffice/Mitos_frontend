// utils/auth.js
export const getUserRole = () => {
  // Check in this order: localStorage -> cookie -> default 'guest'
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userRole') || 
           document.cookie.split('; ')
             .find(row => row.startsWith('userRole='))
             ?.split('=')[1] || 
           'guest';
  }
  return 'guest';
};

export const setUserRole = (role) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userRole', role);
    document.cookie = `userRole=${role}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
  }
};

export const clearUserRole = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userRole');
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};