const passport = require('passport');
const User = require('../../models/user');
const emailOtp = require('../../utilities/emailOtp');
const generateRandomOTP = require('../../utilities/generateOtp');
const cart = require('../../models/cart');

// 👉 **GET: Sign-in Page**
exports.getSignInPage = (req, res) => {
    let detail = {
        username: req.session.username,
        emailOrPhone: req.session.value,
    };
    console.log('hi')
    res.render('../views/pages/authentication/signin', { detail });
};

// 👉 **POST: Handle Email-or-Phone Sign-in**
exports.handleSignInAuth = async (req, res) => {
    try {
        req.session.value = req.body.emailOrPhone;
        req.session.username = req.body.name;
        req.session.password = req.body.password;

        // Determine if the input is an email or phone number
        if (isNaN(req.session.value)) {
            req.session.email = req.session.value;
            req.session.phone = null;
        } else {
            req.session.phone = req.session.value;
            req.session.email = null;
        }

        // Check if the user already exists
        const user = await User.findOne({ email: req.session.email });
        if (user) {
            return res.send("already") ;
        }

        // Generate and send OTP
        req.session.otp = await generateRandomOTP();
        emailOtp(req.session.otp, req.session.value);  // Send OTP to email or phone number

        // Clear OTP after 10 hours
        setTimeout(() => {
            delete req.session.otp;
            delete req.session.enteredOtp;
        }, 1000 * 60 * 60 * 10);

        res.send('done');
    } catch (err) {
        console.error('Error during sign-in:', err.message);
        res.status(500).send('Internal server error. Please try again later.');
    }
};

// 👉 **Google Authentication**
exports.googleAuth = passport.authenticate('google', { scope: ['openid', 'profile', 'email'] });


exports.googleAuthCallback = async (req, res) => {
    try {
        console.log(":hi")

        req.session.username=req.user.displayName;
        req.session.email=req.user.emails?.[0]?.value;
        // Check if the user already exists
        const user = await User.findOne({ email: req.session.email });
        console.log("1")
        if (user) {

            const isBlocked = await User.findOne({ email: req.session.email, status: 'Suspended' });
            if (isBlocked) {
                req.session.isAuthenticated = false;
                return res.redirect('/auth/blocked');
            }
            req.session.userId = user._id;
            req.session.isAuthenticated = true;
            delete req.session.username;
            delete req.session.phone;
            return res.redirect('/');
        }

        // Create a new user
        let newUser  = await User.create({
            username: req.session.username,
            phone: req.session.phone,
            email: req.session.email
        });
        req.session.userId = newUser._id;
        // Create a cart for the new user
        await cart.create({ user: req.session.user });

        delete req.session.username;
        req.session.isAuthenticated = true;
        return res.redirect('/'); // Redirect to a success page
    } catch (err) {
        console.error('Error during Google authentication:', err.message);
        req.session.error = 'Error during authentication. Please try again.';
        return res.redirect('/auth/signin'); // Redirect to sign-in page or an error page
    }
};

// 👉 **Facebook Authentication**
exports.facebookAuth = passport.authenticate('facebook', { scope: ['email'] });

exports.facebookAuthCallback = async (req, res) => {
    try {
        
        req.session.username = req.user.displayName;
        req.session.email = req.user.emails?.[0]?.value;

        // Check if the user already exists
        const user = await User.findOne({ email: req.session.email });
        if (user) {
            const isBlocked = await User.findOne({ email: req.session.email, status: 'Suspended' });
            if (isBlocked) {
                req.session.isAuthenticated = false;
                return res.redirect('/blocked');
            }
            req.session.userId = user._id;
            delete req.session.username;
            delete req.session.phone;
            delete req.session.email;
            req.session.isAuthenticated = true;
            return res.redirect('/');
        }

        // Create a new user
        const newUser= await User.create({
            username: req.session.username,
            phone: req.session.phone,
            email: req.session.email
        });
        req.session.userId = newUser._id;

        delete req.session.username;
        delete req.session.phone;
        delete req.session.email;
        req.session.isAuthenticated = true;

        return res.redirect('/'); // Redirect to a success page
    } catch (err) {
        console.error('Error during Facebook authentication:', err.message);
        req.session.error = 'Error during authentication. Please try again.';
        return res.redirect('/auth/signin'); // Redirect to sign-in page or an error page
    }
};