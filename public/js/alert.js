export const showAlert = (type,msg) => {
    hideAlert();
    const className = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', className);
    window.setTimeout(hideAlert,3000);
}

export const hideAlert = () => {
    const element = document.querySelector('.alert');
    if(element) {
        element.parentElement.removeChild(element);
    }
}