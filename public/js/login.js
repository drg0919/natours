import axios from 'axios';
import {showAlert} from './alert';

export const login = async (email,password) => {
    try{
    const res = await axios({
        method: 'POST',
        url: '/api/v1/users/login',
        data: {
          email,
          password
        }
    });
    if(res.data.status === 'success') {
        showAlert('success','Login successful');
        window.setTimeout(() => location.assign('/'), 3000);
    }
    }
    catch(err){
        showAlert('error',err.response.data.message);
        window.setTimeout(() => location.reload(),3200);
}
}

export const logout = async () => {
    try {
        const res = await axios.get('/api/v1/users/logout');
        if(res.data.status=='success')
        {   
            showAlert('success', 'Logged out succesfully');
            window.setTimeout(() => location.assign('/'),1000);
        }
    }
    catch(err) {
        showAlert('error', 'Something went wrong, try again');
    }
}