'use strict';

let usersData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadVisitedUsers();
    loadUsers();

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        filterUsers(searchInput.value.trim().toLowerCase());
    });

    document.getElementById('tableViewBtn').addEventListener('click', () => {
        toggleView('table-view', 'card-view');
    });

    document.getElementById('cardViewBtn').addEventListener('click', () => {
        toggleView('card-view', 'table-view');
    });

    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addUser();
    });

    document.getElementById('content').addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-user')) {
            const userId = e.target.getAttribute('data-id');
            await deleteUser(userId);
        }
    });

});

function loadVisitedUsers() {
    const visitedUsers = JSON.parse(localStorage.getItem('visitedUsers')) || [];
    const visitedUsersContainer = document.getElementById('visitedUsersContainer');
    const visitedUsersTitle = document.getElementById('visitedUsersTitle');

    visitedUsersContainer.innerHTML = '';


    if (visitedUsers.length === 0) {
        visitedUsersTitle.style.display = 'none';
    } else {
        visitedUsersTitle.style.display = 'block';
        visitedUsers.forEach(user => {
            const userCard = createVisitedUserCard(user);
            visitedUsersContainer.appendChild(userCard);
        });
    }
}


function openUserErrorModal(errorMessage) {
    const userErrorModal = new bootstrap.Modal(document.getElementById('userErrorModal'));
    const errorTextElement = document.getElementById('errorText');
    errorTextElement.textContent = errorMessage;
    userErrorModal.show();
}

function openUserSuccessModal(successMessage) {
    const userSuccessModal = new bootstrap.Modal(document.getElementById('userSuccessModal'));
    const successTextElement = document.getElementById('successText');
    successTextElement.textContent = successMessage;
    userSuccessModal.show();
}

async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

async function loadUsers() {
    try {
        usersData = await fetchUsers();
        renderUsers(usersData);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function renderUsers(users) {
    const userContainer = document.getElementById('content');
    userContainer.innerHTML = '';

    users.forEach(user => {
        const userCard = createUserCard(user);
        userContainer.appendChild(userCard);
    });
}


function createVisitedUserCard(user) {
    const userCard = document.createElement('div');
    userCard.className = 'col-lg-3 col-md-6 col-sm-12 mb-4 user-card';
    userCard.innerHTML = `
        <div class="card">
            <div class="card-body">
            <div  style=" display:flex; justify-content:space-between">
            <h5 class="card-title">${user.first_name} ${user.last_name}</h5>
            </div>
                <p class="card-text">Email: ${user.email}</p>
                <a href="user.html?id=${user.id}" class="btn btn-primary">View Details</a>
            </div>
               
        </div>
    `;
    return userCard;
}

function createUserCard(user) {
    const userCard = document.createElement('div');
    userCard.className = 'col-lg-3 col-md-6 col-sm-12 mb-4 user-card';
    userCard.innerHTML = `
        <div class="card">
            <div class="card-body">
            <div  style=" display:flex; justify-content:space-between">
            <h5 class="card-title">${user.first_name} ${user.last_name}</h5>
               <button type="button" class="btn btn-warning mt-2 delete-user" style="color:white; width:25px; padding:0; border-radius:100%; text-align:center; cursor: pointer" data-id="${user.id}">x</button>
            </div>
                <p class="card-text">Email: ${user.email}</p>
                <a href="user.html?id=${user.id}" class="btn btn-primary">View Details</a>
            </div>
               
        </div>
    `;
    return userCard;
}

async function addUser() {
    try {
        const users = await fetchUsers();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;

        if (users.some(user => user.email === email)) {
            alert('User with this email already exists!');
            return;
        }

        const newUser = {
            first_name: firstName,
            last_name: lastName,
            email: email,
        };
        await saveUser(newUser);


    } catch (error) {
        console.error('Error adding user:', error);
    }
}

async function saveUser(newUser) {
    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });
        document.getElementById('addUserForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();

        if (response.ok) {
            return openUserSuccessModal('Successfully added!');
        } else if (!response.ok) {
            throw new Error('Failed to save user');

        }

    } catch (error) {
        console.error('Error saving user:', error);
    }



}

async function deleteUser(userId) {
    try {
        const response = await fetch("http://localhost:3000/users/" + userId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 200) {
            console.log('User deleted successfully');
            openUserSuccessModal('Successfully deleted!');
            loadUsers();
        } else {
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        openUserErrorModal('Failed to delete user on server');
    }
}

function toggleView(showClass, hideClass) {
    const content = document.getElementById('content');
    content.classList.add(showClass);
    content.classList.remove(hideClass);
}

function filterUsers(searchTerm) {
    const filteredUsers = usersData.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm) ||
        user.last_name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );

    renderUsers(filteredUsers);
}




