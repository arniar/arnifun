// Authentication Middleware
function isAuthenticated(req, res, next) {
    if (!req.user || !req.session || !req.session.isAuthenticated) {
        return res.redirect('/auth/login');
    }
    next();
}

module.exports = isAuthenticated;
