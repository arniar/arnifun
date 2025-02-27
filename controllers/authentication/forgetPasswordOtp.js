// controllers/otpController.js
const generateRandomOTP = require('../../utilities/generateOtp');
const emailOtp = require('../../utilities/emailOtp');

exports.getOtpPage = (req, res, next) => {
  const value = req.session.value; 
  let error = req.session.error || null; 
  req.session.error = null; 
  res.render('../views/pages/authentication/forgetPasswordOtp', { value, error });
};

exports.verifyOtp = (req, res, next) => {
  try {
    // Ensure the OTP and session OTP exist
    if (!req.session.otp) {
      req.session.error = 'Session expired. Please request a new OTP.';
      return res.redirect('/auth/forgetPasswordOtp');
    }

    // Combine entered OTP from req.body
    req.session.enteredOtp = Object.values(req.body).join("").trim();
    console.log(req.session.enteredOtp);
    console.log(req.session.otp);

    // Compare entered OTP with session OTP
    if (req.session.enteredOtp === req.session.otp) {
      return res.redirect('/auth/resetPassword');
    } else {
      req.session.error = 'Invalid OTP. Please try again.';
      return res.redirect('/auth/forgetPasswordOtp');
    }

  } catch (error) {
    console.error('Error in OTP verification:', error);
    req.session.error = 'Something went wrong. Please try again.';
    return res.redirect('/auth/forgetPasswordOtp');
  }
};

exports.resendOtp = async (req, res) => {
  try {
    req.session.otp = await generateRandomOTP();
    await emailOtp(req.session.otp, req.session.value);  // Send OTP to email or phone number
    console.log(req.session.otp);
    console.log(req.session.value);
    console.log(req.session.email);
    
    // Set a timeout to clear OTP after 10 hours
    setTimeout(() => {
      delete req.session.otp;
      delete req.session.enteredOtp;
    }, 1000 * 60 * 60 * 10);
    
    return res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return res.status(500).json({ message: 'Failed to resend OTP.' });
  }
};