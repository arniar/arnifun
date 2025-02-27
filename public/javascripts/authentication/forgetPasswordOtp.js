document.addEventListener('DOMContentLoaded', () => {
    const otpInputs = document.querySelectorAll('.otp-inputs input');

    // Handle input for OTP fields
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Allow only one digit
            e.target.value = value.replace(/[^0-9]/g, '').slice(0, 1);

            // Move to the next input if there's a value
            if (value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        // Handle backspace to move to the previous input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (!e.target.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });

        // Handle paste event to fill OTP inputs
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, otpInputs.length);
            if (/^\d+$/.test(pastedData)) {
                otpInputs.forEach((input, i) => {
                    input.value = pastedData[i] || '';
                });
                otpInputs[Math.min(pastedData.length, otpInputs.length - 1)].focus();
            }
        });
    });
});

// Timer for Resend OTP
let countdown = 60; // Timer duration in seconds
const resendBtn = document.getElementById('resendBtn');
const timerDisplay = document.getElementById('timer');

// Initialize localStorage values if not already set
if (!localStorage.getItem('count3')) localStorage.setItem('count3', 0);
if (!localStorage.getItem('expiryTime1')) localStorage.setItem('expiryTime1', 0);

// Function to start the timer
function startTimer() {
    const count = parseInt(localStorage.getItem('count3'), 10);

    // Check if user hit resend limit
    if (count >= 5) {
        const currentTime = new Date().getTime();
        const expiryTime = parseInt(localStorage.getItem('expiryTime1'), 10);

        if (currentTime < expiryTime) {
            const remainingTime = Math.ceil((expiryTime - currentTime) / 1000);
            timerDisplay.textContent = `Try again after ${Math.floor(remainingTime / 60)} minutes`;
            resendBtn.style.pointerEvents = 'none';
            resendBtn.style.color = '#C4AA7B';
            return;
        } else {
            // Reset count if expiry time has passed
            localStorage.setItem('count3', 0);
            localStorage.removeItem('expiryTime1');
        }
    }

    // Start the countdown
    resendBtn.style.pointerEvents = 'none'; // Disable button
    resendBtn.style.color = '#C4AA7B'; // Muted color for disabled state

    const timerInterval = setInterval(() => {
        timerDisplay.textContent = `Resend available in ${countdown}s`;
        countdown--;

        if (countdown < 0) {
            clearInterval(timerInterval);
            resendBtn.style.pointerEvents = 'auto'; // Enable button
            resendBtn.style.color = '#EBCB92'; // Active state color
            timerDisplay.textContent = 'You can now resend the OTP!';
        }
    }, 1000);
}

// Function to set expiry timestamp for 12 hours
function setExpiryTime() {
    const currentTime = new Date().getTime();
    const expiryTime = currentTime + 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    localStorage.setItem('expiryTime1', expiryTime);
}

// Event Listener for Resend Button
resendBtn.addEventListener('click', () => {
    let count = parseInt(localStorage.getItem('count3'), 10);

    if (count >= 5) {
        alert('You have reached the maximum resend attempts. Try again after 12 hours.');
        return;
    }

    alert('OTP has been resent!');
    count++;
    localStorage.setItem('count3', count);

    if (count === 5) {
        setExpiryTime();
        alert('You have reached the maximum attempts. Please wait 12 hours.');
    }

    countdown = 60; // Reset countdown
    startTimer(); // Restart the timer
});

// Function to reset resend count if expiry time has passed
function resetCountIfExpired() {
    const currentTime = new Date().getTime();
    const expiryTime = parseInt(localStorage.getItem('expiryTime1'), 10);

    if (expiryTime && currentTime > expiryTime) {
        localStorage.setItem('count3', 0); // Reset count
        localStorage.removeItem('expiryTime1'); // Remove expiry time
    }
}

// Initialize on page load
resetCountIfExpired();
startTimer();

// Function to resend OTP
function resend() {
    let count = parseInt(localStorage.getItem('count3'), 10);
    if (count >= 5) {
        return;
    }
    fetch('/auth/forgetPasswordOtp/resendOtp', {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            console.log('POST request sent successfully');
        } else {
            console.error('Failed to send POST request');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Background canvas animation
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
let mousePosition = { x: 0, y: 0 };

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 100;
        const colors = [
            'hsla(45, 100%, 50%, 0.2)',  // Gold
            'hsla(280, 70%, 40%, 0.2)',  // Deep Purple
            'hsla(350, 70%, 40%, 0.2)'   // Dark Red
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;

        if (this.life >= this.maxLife ||
            this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        const opacity = 1 - (this.life / this.maxLife);
        ctx.fillStyle = this.color.replace('0.2', opacity * 0.2);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particles = Array.from({ length: 100 }, () => new Particle());

function animate() {
    ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    const mouseGradient = ctx.createRadialGradient(
        mousePosition.x, mousePosition.y, 0,
        mousePosition.x, mousePosition.y, 150
    );
    mouseGradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
    mouseGradient.addColorStop(1, 'rgba(18, 18, 18, 0)');
    ctx.fillStyle = mouseGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (e) => {
    mousePosition = { x: e.clientX, y: e.clientY };
});

animate();

// Scroll animations for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate sections on scroll
document.querySelectorAll('.section-title, .category, .product-card, .blog-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});