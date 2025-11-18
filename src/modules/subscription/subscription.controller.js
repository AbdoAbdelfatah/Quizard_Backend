import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { UserService } from "../user/user.service.js";
import { SubscriptionService } from "./subscription.service.js";
import Plan from "../../models/plan.model.js";
const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  async createCheckoutSession(req, res, next) {
    try {
      const { planId } = req.body;
      const user = req.authUser;

      const plan = await Plan.findById(planId);
      if (!plan) return res.status(404).json({ message: "Plan not found" });

      if (!plan.stripePriceId)
        return res.status(400).json({ message: "Plan missing Stripe priceId" });

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
        metadata: { userId: user._id },
        subscription_data: {
          metadata: { userId: user._id },
        },
      });

      return res.json({ url: session.url });
    } catch (error) {
      next(
        new ClassError("Failed to create checkout session: " + error.message)
      );
    }
  }

  async handleStripeWebhook(req, res) {
    let event;
    try {
      const signature = req.headers["stripe-signature"];

      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // ---- Extracted common logic into reusable function ----
      const processSubscription = async (stripeSubscription) => {
        const userId = stripeSubscription.metadata.userId;

        // find plan linked with this stripe price
        const plan = await Plan.findOne({
          stripePriceId: stripeSubscription.items.data[0].price.id,
        });

        // create local subscription in DB
        const newSub = await subscriptionService.createSubscription({
          user: userId,
          plan: plan._id,
          startDate: new Date(stripeSubscription.current_period_start * 1000),
          endDate: new Date(stripeSubscription.current_period_end * 1000),
          creditsAllocated: plan.credits,
        });

        // link this subscription to the user
        await UserService.updateUser(userId, {
          currentSubscription: newSub._id,
        });
      };

      // ----------------------------------
      //          HANDLE EVENT TYPES
      // ----------------------------------

      switch (event.type) {
        case "customer.subscription.created": {
          await processSubscription(event.data.object);
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;

          // fetch full subscription to access metadata
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          );

          await processSubscription(subscription);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const userId = subscription.metadata.userId;

          await User.findByIdAndUpdate(userId, {
            currentSubscription: null,
          });

          break;
        }
      }

      return res.json({ received: true });
    } catch (err) {
      console.log("Webhook error:", err);
      return res.status(500).send("Webhook processing error");
    }
  }
}
