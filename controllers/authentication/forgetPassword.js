// controllers/forgetPasswordController.js

const User = require('../../models/user');
const emailOtp = require('../../utilities/emailOtp');
const generateRandomOTP = require('../../utilities/generateOtp');

// GET forget password page
exports.getForgetPasswordPage = (req, res, next) => {
    let detail = {
        emailOrPhone: req.session.value,
    };
    let error = req.session.error || null; // Retrieve error message from session, if any
    req.session.error = null; 
    res.render('../views/pages/authentication/forgetPassword', { detail, error });
};

// POST send OTP
exports.sendOtp = async (req, res) => {
    try {
        req.session.value = req.body.emailOrPhone;
        let field = isNaN(req.session.value) ? 'email' : 'phone';
        let query = isNaN(req.session.value) ? { email: req.session.value } : { phone: req.session.value };

        const user = await User.findOne(query);
        if (!user) {
            req.session.error = "User  not found";
            return res.redirect('/auth/forgetPassword');
        }

        req.session.otp = await generateRandomOTP();
        emailOtp(req.session.otp, req.session.value);  // Send OTP to email or phone number

        // OTP expires in 10 minutes
        setTimeout(() => {
            delete req.session.otp;
            delete req.session.enteredOtp;
        }, 1000 * 60 * 10); // 10 minutes expiration

        res.redirect('/auth/forgetPasswordOtp');
    } catch (error) {
        console.error("Error in sending OTP:", error);
        req.session.error = "Something went wrong. Please try again.";
        res.redirect('/auth/forgetPassword');
    }
};