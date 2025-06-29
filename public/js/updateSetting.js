import axios from 'axios';
import { showAlert } from './alerts';

//type is either data or password
export const updateSettings = async (data, type) => {
  try {
    const  url = 
      type === 'password' 
        ? 'http://localhost:3000/api/v1/users/updatePassword' 
        : 'http://localhost:3000/api/v1/users/updateProfile'; 

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Update Success`);
    }

  } catch(err) {
    showAlert('error', err.response.data.message);
  }
};