export const isTokenExpired = () => {
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return true;

    return new Date().getTime() > parseInt(tokenExpiry);
};
