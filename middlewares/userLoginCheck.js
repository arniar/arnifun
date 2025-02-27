// // Authentication Middleware
function isAuthenticated(req, res, next) {
    if (!req.user || typeof req.user !== 'object' || !req.session.isAuthenticated) {
        return res.redirect('/auth/login');
    }
    next();
}

module.exports = isAuthenticated;