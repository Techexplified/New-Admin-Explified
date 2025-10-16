const ADMIN_EMAIL = "admin@explified.com";
const ADMIN_PASSWORD = "exp123";

export const login = (email, password) => {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem("isAuthenticated", "true");
    return true;
  }
  return false;
};

export const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

export const logout = () => {
  localStorage.removeItem("isAuthenticated");
};
