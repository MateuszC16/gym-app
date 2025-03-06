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
                <form id="login-form">
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
                <form id="register-form">
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

    function setupEventListeners() {
        loginLink.addEventListener('click', function(event) {
            event.preventDefault();
            modal.style.display = 'block';
            loginFormContainer.style.display = 'block';
            registerFormContainer.style.display = 'none';
        });

        registerLink.addEventListener('click', function(event) {
            event.preventDefault();
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

        // Handle form submissions
        document.getElementById('login-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            const login = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            const response = await fetch(`${window.SERVER_URL}api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });

            if (response.ok) {
                location.reload();
            } else {
                alert('Błąd logowania');
            }
        });

        document.getElementById('register-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            const first_name = document.getElementById('register-first-name').value;
            const last_name = document.getElementById('register-last-name').value;
            const gmail = document.getElementById('register-gmail').value;
            const login = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            const response = await fetch(`${window.SERVER_URL}api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first_name, last_name, gmail, login, password })
            });

            if (response.ok) {
                location.reload();
            } else {
                alert('Błąd rejestracji');
            }
        });
    }

    // Check session and update UI
    fetch(`${window.SERVER_URL}api/session`)
        .then(response => response.json())
        .then(data => {
            const sessionContainer = document.querySelector('.session-container');
            if (data.loggedIn) {
                sessionContainer.innerHTML = `Witaj, ${data.username}`;
            } else {
                sessionContainer.innerHTML = `
                    <a href="#" class="session-item" id="login-link">Zaloguj się</a>
                    <a href="#" class="session-item" id="register-link">Zarejestruj się</a>
                `;
                setupEventListeners();
            }
        });
});
