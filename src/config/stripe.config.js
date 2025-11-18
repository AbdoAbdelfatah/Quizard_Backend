import Stripe from "stripe";
export const stripe = async () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};
