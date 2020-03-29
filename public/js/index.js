import '@babel/polyfill';
import {login,logout} from './login';
import {displayMap} from './mapBox';
import {updateSettings,updatePassword} from './updateSettings';
import { bookTour } from './stripe';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBut = document.querySelector('.nav__el--logout');
const userUpdate = document.querySelector('.form-user-data');
const userUpdatePassword = document.querySelector('.form-user-password');
const bookButton = document.querySelector('#booktour');

if(map)
{
const locations = JSON.parse(document.getElementById('map').dataset.locations);
displayMap(locations);
}

if(loginForm)
{
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email,password);    
});
}

if(logoutBut) {
    logoutBut.addEventListener('click', logout);
}

if(userUpdate) {
    userUpdate.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name',document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form);
        // const name = document.getElementById('name').value;
        // const email = document.getElementById('email').value;
        // const photo = document.getElementById('photo').files;
        // updateSettings(name,email,photo[0]);
    })
}

if(userUpdatePassword) {
    userUpdatePassword.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').innerHTML = 'Updating....';
        const currentPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmNewPassword = document.getElementById('password-confirm').value;
        await updatePassword(currentPassword,newPassword,confirmNewPassword);
        document.querySelector('.btn--save-password').innerHTML = 'Save Password';
        document.getElementById('password-current').textContent = '';
        document.getElementById('password').textContent = '';
        document.getElementById('password-confirm').textContent = '';
    })  
}

if(bookButton) 
    bookButton.addEventListener('click', (eve) => {
        eve.target.textContent = 'Processing';
        const {tourId} = eve.target.dataset;
        bookTour(tourId); 
    })