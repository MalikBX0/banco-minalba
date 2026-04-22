// Simulación de Tasas BCV
const bcvRates = {
    usd: 36.45, // Tasa ejemplo
    eur: 39.12
};

// Estado Global
let currentUser = null;
let balance = 0;
let history = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadRates();
    checkSession();
});

function loadRates() {
    document.getElementById('rate-usd').innerText = bcvRates.usd.toFixed(2);
    document.getElementById('rate-eur').innerText = bcvRates.eur.toFixed(2);
}

function toggleAuth() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

// Sistema de Autenticación
function handleAuth(type) {
    const user = type === 'login' ? document.getElementById('login-user').value : document.getElementById('reg-user').value;
    const pass = type === 'login' ? document.getElementById('login-pass').value : document.getElementById('reg-pass').value;

    if (!user || !pass) return alert("Completa todos los campos");

    if (type === 'register') {
        const userData = { user, pass, balance: 0, history: [] };
        localStorage.setItem(`user_${user}`, JSON.stringify(userData));
        alert("Registro exitoso. ¡Inicia sesión!");
        toggleAuth();
    } else {
        const stored = JSON.parse(localStorage.getItem(`user_${user}`));
        if (stored && stored.pass === pass) {
            currentUser = user;
            sessionStorage.setItem('session', user);
            initDashboard(stored);
        } else {
            alert("Credenciales inválidas");
        }
    }
}

function initDashboard(data) {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('display-username').innerText = `Hola, ${data.user}`;
    balance = data.balance;
    history = data.history;
    updateUI();
}

// Gestión de Saldo
function updateBalance(type) {
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    
    if (isNaN(amount) || amount <= 0) return alert("Monto no válido");

    if (type === 'withdraw' && amount > balance) {
        return alert("Fondos insuficientes");
    }

    if (type === 'deposit') {
        balance += amount;
    } else {
        balance -= amount;
    }

    // Registrar movimiento
    const movement = {
        date: new Date().toLocaleDateString(),
        type: type === 'deposit' ? 'Depósito' : 'Retiro',
        amount: amount
    };
    history.unshift(movement);

    saveData();
    updateUI();
    document.getElementById('transaction-amount').value = '';
}

function updateUI() {
    document.getElementById('balance-amount').innerText = `Bs. ${balance.toLocaleString('de-DE', {minimumFractionDigits: 2})}`;
    
    // Conversión automática a divisas
    document.getElementById('conv-usd').innerText = `$ ${(balance / bcvRates.usd).toFixed(2)}`;
    document.getElementById('conv-eur').innerText = `€ ${(balance / bcvRates.eur).toFixed(2)}`;

    // Renderizar tabla
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = history.slice(0, 5).map(m => `
        <tr>
            <td>${m.date}</td>
            <td style="color: ${m.type === 'Depósito' ? '#10b981' : '#ef4444'}">${m.type}</td>
            <td>Bs. ${m.amount.toFixed(2)}</td>
        </tr>
    `).join('');
}

function saveData() {
    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
    userData.balance = balance;
    userData.history = history;
    localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

function checkSession() {
    const session = sessionStorage.getItem('session');
    if (session) {
        const data = JSON.parse(localStorage.getItem(`user_${session}`));
        currentUser = session;
        initDashboard(data);
    }
}
/**
 * Función para exportar la base de datos local a un archivo físico.
 * Como Senior, te recomiendo usar JSON por su compatibilidad.
 */
function exportarCredenciales() {
    // Recopilamos todos los datos que guardamos en localStorage
    const todosLosDatos = {};
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave.startsWith('user_')) {
            todosLosDatos[clave] = JSON.parse(localStorage.getItem(clave));
        }
    }

    // Convertimos el objeto a una cadena de texto
    const dataStr = JSON.stringify(todosLosDatos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    // Creamos un link "invisible" para forzar la descarga
    const exportFileDefaultName = 'db_banco_minalba.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Opcional: Detectar cuando el usuario intenta cerrar la pestaña
window.addEventListener('beforeunload', (event) => {
    // Nota: Los navegadores modernos no permiten descargar archivos automáticamente 
    // al cerrar para evitar spam. Debes llamar a exportarCredenciales() con un botón.
    console.log("Cierre detectado: Asegúrate de haber exportado tus datos.");
});