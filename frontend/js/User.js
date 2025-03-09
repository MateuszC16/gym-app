document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM załadowany');

    // Tworzenie modala
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
                    <label for="login-password">Hasło:</label>
                    <input type="password" id="login-password" name="password" required>
                    <button type="submit">Zaloguj się</button>
                </form>
            </div>
            <div id="register-form-container" class="form-container">
                <h2>Rejestracja</h2>
                <form id="register-form">
                    <label for="register-first-name">Imię:</label>
                    <input type="text" id="register-first-name" name="first_name" required>
                    <label for="register-last-name">Nazwisko:</label>
                    <input type="text" id="register-last-name" name="last_name" required>
                    <label for="register-gmail">Gmail:</label>
                    <input type="email" id="register-gmail" name="gmail" required>
                    <label for="register-username">Login:</label>
                    <input type="text" id="register-username" name="login" required>
                    <label for="register-password">Hasło:</label>
                    <input type="password" id="register-password" name="password" required>
                    <button type="submit">Zarejestruj się</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    console.log('Modal dodany do DOM');

    // Pobranie elementów
    const closeModal = modal.querySelector('.close');
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');

    // Funkcja do ustawiania event listenerów po dodaniu linków
    function setupEventListeners() {
        console.log('Ustawianie event listenerów');

        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');

        if (!loginLink || !registerLink) {
            console.error('Brak linków do logowania/rejestracji!');
            return;
        }

        loginLink.addEventListener('click', function (event) {
            event.preventDefault();
            console.log('Kliknięto "Zaloguj się"');
            modal.style.display = 'block';
            loginFormContainer.style.display = 'block';
            registerFormContainer.style.display = 'none';
        });

        registerLink.addEventListener('click', function (event) {
            event.preventDefault();
            console.log('Kliknięto "Zarejestruj się"');
            modal.style.display = 'block';
            loginFormContainer.style.display = 'none';
            registerFormContainer.style.display = 'block';
        });

        closeModal.addEventListener('click', function () {
            console.log('Zamknięcie modala');
            modal.style.display = 'none';
        });

        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                console.log('Kliknięcie poza modalem');
                modal.style.display = 'none';
            }
        });

        // Obsługa logowania
        document.getElementById('login-form').addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log('Wysłano formularz logowania');

            const login = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            const response = await fetch(`${window.SERVER_URL}api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password }),
                redentials: 'same-origin',
            });

            if (response.ok) {
                console.log('Logowanie udane');
                // Zapisz dane sesji w lokalnym stanie
                localStorage.setItem('user', JSON.stringify({ loggedIn: true, username: data.username }));
                location.reload();
            }
             else {
                console.log('Błąd logowania');
                alert('Niepoprawny login lub hasło');
            }
        });

        // Obsługa rejestracji
        document.getElementById('register-form').addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log('Wysłano formularz rejestracji');

            const first_name = document.getElementById('register-first-name').value;
            const last_name = document.getElementById('register-last-name').value;
            const gmail = document.getElementById('register-gmail').value;
            const login = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            const response = await fetch(`${window.SERVER_URL}api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first_name, last_name, gmail, login, password }),
                redentials: 'same-origin',
            });

            if (response.ok) {
                console.log('Rejestracja udana');
                location.reload();
            } else {
                console.log('Błąd rejestracji');
                alert('Nie udało się zarejestrować');
            }
        });
    }

    // Funkcja do obsługi wylogowania
    async function handleLogout() {
        const response = await fetch(`${window.SERVER_URL}api/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            redentials: 'same-origin',
        });

        if (response.ok) {
            console.log('Wylogowanie udane');
            location.reload();
        } else {
            console.log('Błąd wylogowania');
            alert('Nie udało się wylogować');
        }
    }

    // Sprawdzenie sesji użytkownika
    console.log('Sprawdzanie sesji użytkownika');
    fetch(`${window.SERVER_URL}api/session`, {
        method: 'GET',
        credentials: 'same-origin', // Dodaj tę opcję, aby ciasteczka były wysyłane
    })
        .then(response => response.json())
        .then(data => {
            console.log('Dane sesji:', data);
            const sessionContainer = document.querySelector('.session-container');

            if (data.loggedIn) {
                console.log('Użytkownik zalogowany');
                sessionContainer.innerHTML = `
                    Witaj, ${data.username}
                    <button id="logout-btn">Wyloguj się</button>
                `;
                document.getElementById('logout-btn').addEventListener('click', handleLogout);
            } else {
                console.log('Użytkownik niezalogowany');
                sessionContainer.innerHTML = `
                    <a href="#" class="session-item" id="login-link">Zaloguj się</a>
                    <a href="#" class="session-item" id="register-link">Zarejestruj się</a>
                `;
                setupEventListeners(); // Ustawienie event listenerów po dodaniu linków
            }
        })
        .catch(error => console.error('Błąd pobierania sesji:', error));
});