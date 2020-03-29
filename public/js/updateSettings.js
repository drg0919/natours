import axios from 'axios';
import {showAlert} from './alert';

export const updateSettings = async (data) => {
    try {
        const res = await axios.patch('http://localhost:3000/api/v1/users/updateMe',data);
        if(res.data.status === 'success')
            showAlert('success', "Your credentials have been updated");
        else
            showAlert('error', "Something went wrong");
    }
    catch(err) {
        showAlert('error','Try again later');
    }
}

export const updatePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    try {
        const res = await axios.patch('http://localhost:3000/api/v1/users/changepassword', {
            currentPassword,
            newPassword,
            confirmNewPassword
        });
        if(res.data.status === 'success') {
            showAlert('success', "Password updated");
        }
        else
            showAlert('error', "Something went wrong");
    }
    catch(err) {
        showAlert('error',err.response.data.message);
    }
}