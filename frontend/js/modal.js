document.addEventListener('DOMContentLoaded', function() {
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="login-form-container" class="form-container">
                <h2>Logowanie</h2>
                <form id="login-form" action="/api/login" method="post">
                    <label for="login-username">Login:</label>
                    <input type="text" id="login-username" name="login" required>
                    <br>
                    <label for="login-password">Hasło:</label>
                    <input type="password" id="login-password" name="password" required>
                    <br>
                    <button type="submit">Zaloguj się</button>
                </form>
            </div>
            <div id="register-form-container" class="form-container">
                <h2>Rejestracja</h2>
                <form id="register-form" action="/api/register" method="post">
                    <label for="register-first-name">Imię:</label>
                    <input type="text" id="register-first-name" name="first_name" required>
                    <br>
                    <label for="register-last-name">Nazwisko:</label>
                    <input type="text" id="register-last-name" name="last_name" required>
                    <br>
                    <label for="register-gmail">Gmail:</label>
                    <input type="email" id="register-gmail" name="gmail" required>
                    <br>
                    <label for="register-username">Login:</label>
                    <input type="text" id="register-username" name="login" required>
                    <br>
                    <label for="register-password">Hasło:</label>
                    <input type="password" id="register-password" name="password" required>
                    <br>
                    <button type="submit">Zarejestruj się</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const closeModal = modal.querySelector('.close');
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');

    loginLink.addEventListener('click', function() {
        modal.style.display = 'block';
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
    });

    registerLink.addEventListener('click', function() {
        modal.style.display = 'block';
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});
