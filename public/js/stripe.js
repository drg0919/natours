import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_DfFkqUNC1M8DE14UtWZWeClP00raiKKLnY');

export const bookTour = async (tourID) => {
    try{
    const session = await axios.get(`http://localhost:3000/api/v1/bookings/checkout/${tourID}`);
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    })
    }
    catch(err) {
        showAlert('error', err);
    }
}