'use strict'

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('course.html')) {
        loadCourseDetails();
    }
});

async function fetchData(file) {
    const response = await fetch(file);
    return await response.json();
}

async function loadCourseDetails() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');
    const coursesData = await fetchData('courses-db.json');
    const usersData = await fetchData('users-db.json');
    const course = coursesData.find(course => course.id == courseId);

    if (!course) {
        alert('Course not found');
        return;
    }

    const courseDetails = document.getElementById('courseDetails');
    const user = usersData.users.find(u => u.id == course.userId);

    courseDetails.innerHTML = `
    <div class="card mb-4">
        <div class="card-header">
            <h2>${course.title}</h2>
        </div>
        <div class="card-body">
            <p class="card-text"><strong>Category:</strong> ${course.category}</p>
            <p class="card-text"><strong>Description:</strong> ${course.description}</p>
            <p class="card-text"><strong>Duration:</strong> ${course.duration}</p>
            <h3 class="card-title mt-4">Enrolled User</h3>
            <p class="card-text"><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
            <p class="card-text"><strong>Email:</strong> ${user.email}</p>
        </div>
    </div>
`;
}
