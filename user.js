'use strict';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('user.html')) {
        loadUserDetails();
    }

    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', async (e) => {

            try {
                const user = await fetchUser(userId);
                populateEditForm(user);
                openEditUserModal();
            } catch (error) {
                console.error('Error fetching user details:', error);
                alert('Failed to fetch user details. Please try again.');
            }
        });
    });

    document.getElementById('editUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('id');
        const updatedUser = {
            first_name: document.getElementById('editFirstName').value,
            last_name: document.getElementById('editLastName').value,
            email: document.getElementById('editEmail').value,
        };

        try {
            await updateUser(userId, updatedUser);
            alert('User updated successfully!');
            window.location.href = `user.html?id=${userId}`;
            loadUserDetails();

        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
        }
    });

});

async function fetchUser(userId) {
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}

function populateEditForm(user) {
    document.getElementById('editFirstName').value = user.first_name;
    document.getElementById('editLastName').value = user.last_name;
    document.getElementById('editEmail').value = user.email;

}


function openEditUserModal() {
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'), {
        keyboard: false
    });
    editUserModal.show();
}

async function updateUser(userId, updatedUser) {
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

async function fetchData(file) {
    const response = await fetch(file);
    return await response.json();
}

function storeVisitedUser(newUser) {
    let visitedUsers = JSON.parse(localStorage.getItem('visitedUsers')) || [];

    visitedUsers = visitedUsers.filter(user => user.id !== newUser.id);

    visitedUsers.unshift(newUser);

    if (visitedUsers.length > 3) {
        visitedUsers.pop();
    }

    localStorage.setItem('visitedUsers', JSON.stringify(visitedUsers));
}


async function loadUserDetails() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const usersData = await fetchData('http://localhost:3000/users');
    const coursesData = await fetchData('courses-db.json');
    const user = usersData.find(user => user.id == userId);

    if (!user) {
        alert('User not found');
        return;
    }

    storeVisitedUser(user);

    const userDetails = document.getElementById('userDetails');
    userDetails.innerHTML = `
       <div class="row">
            <div class="col-lg-6 col-md-12 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                    <div style="display:flex; justify-content:space-between">
                    <h2>${user.first_name} ${user.last_name}</h2>
                    <button type="button" class="btn btn-danger mt-2 edit-user" style="color:white;  text-align:center; cursor: pointer" data-id="${user.id}" data-bs-toggle="modal"
                    data-bs-target="#editUserModal" id="addUserBtn">Edit</button>
                    </div>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Age:</strong> ${user.age}</p>
                        <p><strong>Gender:</strong> ${user.gender}</p>
                        <p><strong>Phone:</strong> ${user.phone}</p>
                        <p><strong>Username:</strong> ${user.username}</p>
                        <p><strong>Birthdate:</strong> ${user.birthdate}</p>
                        <p><strong>Height:</strong> ${user.height} cm</p>
                        <p><strong>Weight:</strong> ${user.weight} kg</p>
                        <p><strong>Education:</strong> ${user.education}</p>
                        <p><strong>Company:</strong> ${user.company?.name}</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 col-md-12 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h3>Courses</h3>
                        <div id="coursesContainer"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    const userCourses = coursesData.filter(course => course.userId == user.id);
    const coursesContainer = document.getElementById('coursesContainer');

    if (userCourses.length > 0) {
        userCourses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'col-12 mb-3';
            courseElement.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h4 class="card-title">${course.title}</h4>
                        <h5 class="card-category">${course.category}</h5>
                        <p class="card-text">${course.description}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <small>Duration: ${course.duration}</small>
                        <a href="course.html?id=${course.id}" class="btn btn-primary mt-2">View Course Details</a>
                    </div>
                </div>
            `;
            coursesContainer.appendChild(courseElement);
        });
    } else {
        coursesContainer.innerHTML = '<p>No courses found for this user.</p>';
    }
}
