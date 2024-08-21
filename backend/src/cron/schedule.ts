import cron from "node-cron"
import { appDataSource } from "../config/db";
import { Offer } from "../entities/Offer";
import { UserMembership } from "../entities/UserMembership";
import { LessThan, LessThanOrEqual } from "typeorm";

// Function to check and update expired offers
const checkOffersExpiry = async () => {
  const offerRepository = appDataSource.getRepository(Offer);
  const currentDate = new Date();

  try {
    // Find all active offers where the end_date is less than the current date
    const expiredOffers = await offerRepository.find({
      where: {
        active: true,
        end_date: LessThan(currentDate),
      },
    });

    // Set active to false for each expired offer
    for (const offer of expiredOffers) {
      offer.active = false;
      await offerRepository.save(offer);
    }

    console.log(`Checked offers expiry at ${currentDate}.`);
  } catch (error) {
    console.error("Error checking offers expiry:", error);
  }
};

// Function to check and update expired user memberships
const checkUserMembershipsExpiry = async () => {
  const userMembershipRepository = appDataSource.getRepository(UserMembership);
  const currentDate = new Date();

  try {
    // Find all active user memberships where the end_date is less than or equal to the current date
    const expiredMemberships = await userMembershipRepository.find({
      where: {
        is_active: true,
        end_date: LessThanOrEqual(currentDate),
      },
    });

    // Set is_active to false and status to expired for each expired membership
    for (const membership of expiredMemberships) {
      membership.is_active = false;
      membership.status = "expired";
      await userMembershipRepository.save(membership);
    }

    console.log(`Checked user memberships expiry at ${currentDate}.`);
  } catch (error) {
    console.error("Error checking user memberships expiry:", error);
  }
};

// Schedule the tasks to run every day at midnight
cron.schedule("0 0 * * *", () => {
  checkOffersExpiry();
  checkUserMembershipsExpiry();
});
