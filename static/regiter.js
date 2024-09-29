document.addEventListener('DOMContentLoaded', function() {
    var loginContainer = document.getElementById('loginContainer');
    var registerContainer = document.getElementById('registerContainer');

    // Обработчики для переключения между формами регистрации и входа
    document.getElementById('showRegisterForm').addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });

    document.getElementById('showLoginForm').addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.style.display = 'block';
        registerContainer.style.display = 'none';
    });

    // Обработчик формы входа
    var loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var username = document.getElementById('loginUsername').value;
        var password = document.getElementById('loginPassword').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Login response:', data);
            if (data.message === 'Login successful') {
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('email', data.email);
                window.location.href = 'user-info'; // URL для перехода после входа
            } else {
                alert('Ошибка входа: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Обработчик формы регистрации
    var registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var username = document.getElementById('registerUsername').value;
        var email = document.getElementById('registerEmail').value;
        var password = document.getElementById('registerPassword').value;

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, email: email, password: password })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Register response:', data);
            if (data.message === 'Registration successful') {
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('email', data.email);
                window.location.href = 'user-info'; // URL для перехода после регистрации
            } else {
                alert('Ошибка регистрации: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });
});
