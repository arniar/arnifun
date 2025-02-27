const User = require('../../models/user');

// GET home page
exports.getLoginPage = (req, res) => {
    let detail = {
        emailOrPhone: req.session.value,
    };
    let error = req.session.error || null; // Retrieve error message from session, if any
    req.session.error = null; // Clear error after use
    let emailError = req.session.emailError || null; // Retrieve email error message from session, if any
    req.session.emailError = null; // Clear error after use
    res.render('../views/pages/authentication/login', { detail, error, emailError });
};

// POST login authentication
exports.loginAuth = async (req, res) => {
    req.session.value = req.body.emailOrPhone;
    req.session.password = req.body.password;

    try {
        let user;
        const isBlocked = await User.findOne({ email: req.session.value, status: 'Suspended' });
        if (isBlocked) {
            req.session.isAuthenticated = false;
            return res.redirect('/auth/blocked');
        }

        // Check if the input is an email or phone number
        if (isNaN(req.session.value)) {
            user = await User.findOne({ email: req.session.value });
        } else {
            user = await User.findOne({ phone: req.session.value });
        }

        if (!user) {
            console.log("User  not found");
            req.session.emailError = "User  not found";
            return res.send("new");
        }

        const isMatch = await user.comparePassword(req.session.password);
        console.log("Password Match:", isMatch);

        console.log("Role:", user.role);

        // Check user role and authentication
        if (user.role === "Admin" && isMatch) {
            clearSession(req);
            req.session.isChecked=true;
            return res.send("admin");
        }

        if (isMatch) {
            console.log("Authentication Successful!");
            clearSession(req);
            req.session.isAuthenticated=true;
            req.session.userId = user._id;
            return res.send("done");
        } else {
            req.session.error = "Invalid credentials";
            return res.send("undone");
        }
    } catch (err) {
        console.error("Error during login:", err);
        req.session.error = err.message || "Internal Server Error";
        return res.status(500).send("Internal Server Error");
    }
};

// Helper function to clear session data
function clearSession(req) {
    delete req.session.username;
    delete req.session.phone;
    delete req.session.password;
    delete req.session.value;
}