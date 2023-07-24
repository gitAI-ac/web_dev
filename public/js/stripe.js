/* eslint-disable */
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  // get checkout session from api
  try {
    const stripe = await loadStripe(
      'pk_test_51NWOwdSDfeN1KM09n3aKHvgSMIsI5Av1leNOzcx0OPEj6dxwFdgScPeF7EOXEM1dQVNIKCtZ0WNEKgHdAXKyvXLD00c1IYmvSr'
    );
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }

  //use stripe object to create checkout form
};
