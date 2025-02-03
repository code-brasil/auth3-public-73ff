document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshUsersBtn = document.getElementById('refreshUsers');
    const usersTable = document.getElementById('usersTable');
    const refreshCoursesBtn = document.getElementById('refreshCourses');
    const coursesTable = document.getElementById('coursesTable');
    const addCourseBtn = document.getElementById('addCourseBtn');
    const addCourseModal = document.getElementById('addCourseModal');
    const closeModalBtn = document.getElementById('closeModal');
    const addCourseForm = document.getElementById('addCourseForm');

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
    
    if (refreshCoursesBtn) {
        refreshCoursesBtn.addEventListener('click', loadCourses);
        loadCourses();
    }
    
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => {
            addCourseModal.classList.remove('hidden');
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            addCourseModal.classList.add('hidden');
        });
    }
    
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('courseName').value;
            const description = document.getElementById('courseDescription').value;
            const price = parseFloat(document.getElementById('coursePrice').value) * 100; // Convert to centavos
            
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://localhost:8000/functions/auth3/admin_add_course', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, name, description, price})
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                addCourseModal.classList.add('hidden');
                loadCourses();
            }
        });
    }
    
    if (usersTable) {
        window.editUser = async (id) => {
            const newUsername = prompt('Novo Nome de Usuário:');
            const newEmail = prompt('Novo Email:');
            const newIsAdmin = confirm('É admin?');
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/functions/auth3/admin_update_user', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, id, username: newUsername, email: newEmail, is_admin: newIsAdmin})
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                loadUsers();
            }
        };
    }

    if (usersTable) {
        window.deleteUser = async (id) => {
            if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/functions/auth3/admin_delete_user', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, id})
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                loadUsers();
            }
        };
    }

    async function loadUsers() {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/functions/auth3/admin_get_users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token})
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

    async function loadCourses() {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/functions/auth3/admin_get_courses', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token})
        });
        const result = await response.json();
        if (result.success) {
            coursesTable.innerHTML = '';
            result.courses.forEach(course => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="py-2 px-4 border-b">${course.id}</td>
                    <td class="py-2 px-4 border-b">${course.name}</td>
                    <td class="py-2 px-4 border-b">${course.description}</td>
                    <td class="py-2 px-4 border-b">${(course.price / 100).toFixed(2)}</td>
                    <td class="py-2 px-4 border-b">
                        <button onclick="editCourse(${course.id})" class="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Editar</button>
                        <button onclick="deleteCourse(${course.id})" class="bg-red-500 text-white px-2 py-1 rounded">Deletar</button>
                    </td>
                `;
                coursesTable.appendChild(tr);
            });
        } else {
            alert(result.message);
        }
    }

    window.editCourse = async (id) => {
        const newName = prompt('Novo Nome do Curso:');
        const newDescription = prompt('Nova Descrição:');
        const newPrice = parseFloat(prompt('Novo Preço (R$):')) * 100;
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/functions/auth3/admin_update_course', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token, id, name: newName, description: newDescription, price: newPrice})
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            loadCourses();
        }
    };

    window.deleteCourse = async (id) => {
        if (!confirm('Tem certeza que deseja deletar este curso?')) return;
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/functions/auth3/admin_delete_course', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token, id})
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            loadCourses();
        }
    };
});