import axios from 'axios';
import { showAlert } from './alert';

export const updateUserData = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'password'
          ? '/api/v1/users/updatePassword'
          : '/api/v1/users/updateme',
      data,
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type} updated successfully`, 1500);
      window.setTimeout(() => {
        window.location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', `${err.response}`, 1500);
  }
};
