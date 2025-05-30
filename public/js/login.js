import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async(name, email, role, password, confirmPassword) => {

  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signup',
      data: {
        name,
        email,
        role,
        password,
        confirmPassword
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Signed Up Successfully!');
      window.setTimeout(() => {
        location.assign('/overview');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  
  }
 
}

export const login = async(email, password) => {

  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password
      },
      withCredentials: true
    });
    console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'Logged In Successfully!');
      // window.setTimeout(() => {
      //   location.assign('/overview');
      // }, 2000);
      location.assign('/overview');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  
  }
 
}

export const logout = async () => {

  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout'
    });
    console.log('Logout response:', res); // Debugging log

    if (res.data.status === 'success') {
      showAlert('success', 'Logged Out Successfully!');
      location.reload(true);
    } else {
      console.log('Unexpected logout response:', res.data); // Debugging log
      showAlert('error', 'Unexpected Error Logging Out!');
    }

  } catch (err) {
    console.error('Logout error:', err.response); // Debugging log
    showAlert('error', 'Error Logging Out!');
  }

}

