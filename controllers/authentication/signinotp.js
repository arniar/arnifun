const generateRandomOTP = require('../../utilities/generateOtp');
const emailOtp = require('../../utilities/emailOtp');
const User = require('../../models/user'); // Import the User model


// Function to generate a unique userId
async function generateUniqueUserId() {
  let uniqueId;
  let isUnique = false;

  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    uniqueId = `Arni/${randomNum}`;

    // Check if the generated userId already exists
    const existingUser = await User.findOne({ userId: uniqueId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return uniqueId;
}

// GET users listing
exports.getSigninOtp = async (req, res) => {
  try {
    console.log("hi")
    const value = req.session.value; // Get the email or phone from query params
    let error = req.session.error || null; // Retrieve error message from session, if any
    req.session.error = null; // Clear error after use

    // Render the signinOtp page with value and error
    res.render('../views/pages/authentication/signinotp', { value, error });
  } catch (error) {
    console.error('Error rendering signinOtp page:', error);
    req.session.error = 'Failed to load the OTP page. Please try again.';
    res.redirect('/auth/otp');
  }
};

// POST route for OTP verification
exports.verifyOtp = async (req, res) => {
  try {
    // Ensure the OTP and session OTP exist
    if (!req.session.otp) {
      req.session.error = 'Session expired. Please request a new OTP.';
      return res.redirect('/auth/otp');
    }

    // Extract and combine entered OTP from req.body
    req.session.enteredOtp = Object.values(req.body).join("").trim();
    
    
    // Compare entered OTP with session OTP
    if (req.session.enteredOtp === req.session.otp) {
      // Clear OTP-related session data after successful verification
      delete req.session.otp;
      
      try {
        // Make sure all required registration data exists
        if (!req.session.username  || !req.session.password) {
          throw new Error('Missing registration information');
        }
        
        const userId = await generateUniqueUserId();
        const user = await User.create({
          userId,
          username: req.session.username,
          phone: req.session.phone,
          email: req.session.email || null, // Make email optional
          password: req.session.password
        });
        
        console.log('User created:', user);
        req.session.userId = user._id;
        req.session.isAuthenticated=true;
        
        // Clear registration data from session
        delete req.session.username;
        delete req.session.phone;
        delete req.session.email;
        delete req.session.password;
        delete req.session.value;
        return res.redirect('/'); // Redirect to home page
      } catch (err) {
        console.error('Error registering user:', err);
        req.session.error = 'Error registering user. Please try again.';
        return res.redirect('/auth/register'); // Redirect to registration instead of OTP page
      }
    } else {
      req.session.error = 'Invalid OTP. Please try again.';
      return res.redirect('/auth/otp');
    }
  } catch (error) {
    console.error('Error in OTP verification:', error);
    req.session.error = 'Something went wrong during OTP verification. Please try again.';
    return res.redirect('/auth/otp');
  }
};

// POST route for resending OTP
exports.resendOtp = async (req, res) => {
  try {
    req.session.otp = await generateRandomOTP();
    await emailOtp(req.session.otp, req.session.value);  // Send OTP to email or phone number
    console.log(req.session.otp);
    console.log(req.session.value);
    console.log(req.session.email);
    
    // Clear OTP after 10 hours
    setTimeout(() => {
      delete req.session.otp;
      delete req.session.enteredOtp;
    }, 1000 * 60 * 60 * 10);
    
    res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    req.session.error = 'Failed to resend OTP. Please try again later.';
    return res.status(500).json({ message: 'Failed to resend OTP.' });
  }
};