document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshUsersBtn = document.getElementById('refreshUsers');
    const usersTable = document.getElementById('usersTable');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const response = await fetch('http://localhost:8000/functions/auth3/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, email, password})
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                window.location.href = 'login.html';
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('identifier').value;
            const password = document.getElementById('password').value;
            
            const response = await fetch('http://localhost:8000/functions/auth3/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({identifier, password})
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                if (result.is_admin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                alert(result.message);
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
    
    if (refreshUsersBtn) {
        refreshUsersBtn.addEventListener('click', loadUsers);
        loadUsers();
    }
    
    async function loadUsers() {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/functions/auth3/admin_get_users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        });
        const result = await response.json();
        if (result.success) {
            usersTable.innerHTML = '';
            result.users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="py-2 px-4 border-b">${user.id}</td>
                    <td class="py-2 px-4 border-b">${user.username}</td>
                    <td class="py-2 px-4 border-b">${user.email}</td>
                    <td class="py-2 px-4 border-b">${user.is_admin}</td>
                    <td class="py-2 px-4 border-b">
                        <button onclick="editUser(${user.id})" class="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Editar</button>
                        <button onclick="deleteUser(${user.id})" class="bg-red-500 text-white px-2 py-1 rounded">Deletar</button>
                    </td>
                `;
                usersTable.appendChild(tr);
            });
        } else {
            alert(result.message);
        }
    }

    window.editUser = async (id) => {
        const newUsername = prompt('Novo Nome de Usuário:');
        const newEmail = prompt('Novo Email:');
        const newIsAdmin = confirm('É admin?');
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/functions/auth3/admin_update_user', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({id, username: newUsername, email: newEmail, is_admin: newIsAdmin})
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            loadUsers();
        }
    };

    window.deleteUser = async (id) => {
        if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/functions/auth3/admin_delete_user', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({id})
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            loadUsers();
        }
    };
});