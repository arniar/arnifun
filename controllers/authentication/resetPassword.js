const User = require('../../models/user');
const bcrypt = require('bcryptjs');

// Render the reset password page
exports.getResetPasswordPage = (req, res, next) => {
    res.render('../views/pages/authentication/resetPassword');
};

// Handle password reset confirmation
exports.resetPasswordConfirm = async (req, res) => {
    try {
        const newPassword = req.body.newPassword || req.body.password; // Support both field names
        console.log(newPassword);

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        console.log(req.session.value);

        // Determine query based on session value
        const query = isNaN(req.session.value)
            ? { email: req.session.value }
            : { phone: req.session.value };
        console.log(query);

        // Update the user's password
        const result = await User.updateOne(query, { $set: { password: hashedPassword } });
        console.log(result);

        res.send("done");
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send("An error occurred while resetting the password");
    }
};