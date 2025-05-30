import { signup, login, logout } from './login';
import { updateSettings } from './updateSetting';
import { showAlert } from './alerts';
import axios from 'axios';

const signupForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const createBookForm = document.getElementById('createBookForm');


if (signupForm) 
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    await signup(name, email, role, password, confirmPassword);
  });


if (loginForm) 
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if(userDataForm) 
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({name, email}, 'data');
  });

if(userPasswordForm) 
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateSettings({ currentPassword, newPassword, confirmPassword }, 'password');

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

  });


if (createBookForm) 
  createBookForm.addEventListener('submit', async e => {
    e.preventDefault(); // Prevents the default form submission behavior
  
      // Retrieve values entered by the user for book details
    const name = document.getElementById('name').value;
    const author = document.getElementById('author').value;
    const genre = document.getElementById('genre').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];
    const bookFile = document.getElementById('file').files[0];

     // Create a FormData object to store form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('author', author);
    formData.append('genre', genre);
    formData.append('description', description);
    formData.append('image', imageFile);
    formData.append('file', bookFile);
 
    try {
      // Send POST request with FormData
      const res = await axios({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/books',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data', // Don't forget to set the content type
        },
      });
      
      // Handle response
      if (res.data.status === 'success') {
        showAlert('success', 'Book Added Successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 2000);
      }
    } catch (err) {
      showAlert('error', err.response.message || 'An error occurred');
    }
   
  });