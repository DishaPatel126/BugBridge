document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.querySelector('section');
    signupForm.style.opacity = 0;

    setTimeout(() => {
        signupForm.style.transition = 'opacity 1s ease-in-out';
        signupForm.style.opacity = 1;
    }, 500);

    const signupButton = document.querySelector('button');
    signupButton.addEventListener('click', function () {
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const confirmPasswordInput = document.querySelector('input[type="password"][name="confirm-password"]');

        // Validate email
        // const isEmailValid = emailInput.checkValidity();
        // if (!isEmailValid) {
        //     alert('Please enter a valid email address.');
        //     return;
        // }


        // Validate password
        const isPasswordValid = passwordInput.checkValidity();
        if (!isPasswordValid) {
            alert('Password does not meet the required criteria. Ensure it is at least 8 characters long.');
            return;
        }

        // Validate confirm password
        const isConfirmPasswordValid = confirmPasswordInput.value === passwordInput.value;
        if (!isConfirmPasswordValid) {
            alert('Passwords do not match.');
            return;
        }

        // If all inputs are valid
        const isValid = isEmailValid && isPasswordValid && isConfirmPasswordValid;

        if (!isValid) {
            signupForm.classList.add('shake');

            setTimeout(() => {
                signupForm.classList.remove('shake');
            }, 1000);
        }
    });
});
