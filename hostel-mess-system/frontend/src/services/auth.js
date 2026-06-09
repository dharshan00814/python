function getToken() {
  return localStorage.getItem('adminToken');
}

function isAdmin(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded?.role === 'admin';
  } catch {
    return false;
  }
}

export { getToken, isAdmin };

