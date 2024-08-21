import { Request, Response } from "express";
import { User } from "../../entities/Users";
import { appDataSource } from "../../config/db";
import { StoreProfile } from "../../entities/StoreProfile";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://api.grazle.co.in/";

export class StoreProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      const getUser = (req as any).user;
      const userId = getUser.id; // Extract user ID from token

      // Fetch user profile details along with their role
      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["profile", "userHasRole", "userHasRole.role"],
      });

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }

      // Exclude the password, created_at, and updated_at fields from the response
      const {
        password: _,
        created_at,
        updated_at,
        userHasRole,
        profile: {
          created_at: profile_created_at,
          updated_at: profile_updated_at,
          ...profileWithoutDates
        },
        ...userWithoutPasswordAndDates
      } = user;

      // Append the base URL to the image path
      if (profileWithoutDates.image) {
        profileWithoutDates.image = `${BASE_URL}${profileWithoutDates.image}`;
      }

      // Extract role name from user's role
      const roleName = user.userHasRole?.role?.name || "Unknown";

      let storeProfileResponse = null;

      // If user role is seller, fetch the store profile
      if (roleName === "seller") {
        const storeProfileRepository =
          appDataSource.getRepository(StoreProfile);
        const storeProfile = await storeProfileRepository.findOne({
          where: { user: { id: userId } },
        });

        if (storeProfile) {
          storeProfileResponse = {
            id: storeProfile.id,
            store_name: storeProfile.store_name,
            store_image: storeProfile.store_image,
            store_description: storeProfile.store_description,
            account_name: storeProfile.account_name,
            account_number: storeProfile.account_number,
            bank_name: storeProfile.bank_name,
            bank_code: storeProfile.bank_code,
            business_license: storeProfile.business_license,
            tax_id: storeProfile.tax_id,
            proof_of_address: storeProfile.proof_of_address,
            city: storeProfile.city,
            state: storeProfile.state,
            pin_code: storeProfile.pin_code,
            store_about: storeProfile.store_about,
            store_url: storeProfile.store_url,
            gst: storeProfile.gst,
            pan: storeProfile.pan,
            created_at: storeProfile.created_at,
            updated_at: storeProfile.updated_at,
          };

          // Append the base URL to the store image path
          if (storeProfileResponse.store_image) {
            storeProfileResponse.store_image = `${BASE_URL}${storeProfileResponse.store_image}`;
          }

          if (storeProfileResponse.business_license) {
            storeProfileResponse.business_license = `${BASE_URL}${storeProfileResponse.business_license}`;
          }

          if (storeProfileResponse.tax_id) {
            storeProfileResponse.tax_id = `${BASE_URL}${storeProfileResponse.tax_id}`;
          }

          if (storeProfileResponse.proof_of_address) {
            storeProfileResponse.proof_of_address = `${BASE_URL}${storeProfileResponse.proof_of_address}`;
          }
        }
      }

      res.status(200).json({
        user: {
          ...userWithoutPasswordAndDates,
          profile: profileWithoutDates,
          role: roleName,
          store_profile: storeProfileResponse,
        },
        success: true,
        message: "Profile has been retrieved successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      });
    }
  }

  // async editProfile(req: Request, res: Response) {
  //   try {
  //     const getUser = (req as any).user;
  //     const parsedId = parseInt(getUser.id, 10);

  //     if (isNaN(parsedId)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid user ID",
  //       });
  //     }

  //     const {
  //       store_name,
  //       store_description,
  //       account_name,
  //       account_number,
  //       bank_name,
  //       bank_code,
  //     } = req.body;

  //     const store_image = (req as any).file?.path.replace(/\\/g, "/");

  //     const storeRepo = appDataSource.getRepository(StoreProfile);
  //     let store = await storeRepo.findOne({
  //       where: { user: { id: parsedId } }, // Corrected syntax for querying by nested relation
  //     });

  //     if (!store) {
  //       return res.status(404).json({
  //         error: "Store profile not found",
  //         success: false,
  //         message: "Store profile not found for the provided user ID",
  //       });
  //     }

  //     // Update store profile fields

  //     store.store_name = store_name;
  //     store.store_description = store_description;
  //     store.store_image = store_image;

  //     store.account_name = account_name;
  //     store.account_number = account_number;
  //     store.bank_name = bank_name;
  //     store.bank_code = bank_code;

  //     // Save updated store profile
  //     const updatedStore = await storeRepo.save(store);

  //     res.json({
  //       store: updatedStore,
  //       success: true,
  //       message: "Store profile updated successfully!",
  //     });
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       return res.status(500).json({
  //         error: "Failed to update store profile",
  //         success: false,
  //         message: error.message,
  //       });
  //     } else {
  //       return res.status(500).json({
  //         error: "Unknown error occurred",
  //         success: false,
  //       });
  //     }
  //   }
  // }

  async editProfile(req: Request, res: Response) {
    try {
      const getUser = (req as any).user;
      const parsedId = parseInt(getUser.id, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const {
        store_name,
        store_description,
        account_name,
        account_number,
        bank_name,
        bank_code,
        city,
        state,
        pin_code,
        store_about,
        store_url,
        gst,
        pan,
      } = req.body;

      const store_image = (req as any).files?.store_image?.[0]?.path.replace(
        /\\/g,
        "/"
      );
      const business_license = (
        req as any
      ).files?.business_license?.[0]?.path.replace(/\\/g, "/");
      const tax_id = (req as any).files?.tax_id?.[0]?.path.replace(/\\/g, "/");
      const proof_of_address = (
        req as any
      ).files?.proof_of_address?.[0]?.path.replace(/\\/g, "/");

      const storeRepo = appDataSource.getRepository(StoreProfile);
      let store = await storeRepo.findOne({
        where: { user: { id: parsedId } },
      });

      if (!store) {
        return res.status(404).json({
          error: "Store profile not found",
          success: false,
          message: "Store profile not found for the provided user ID",
        });
      }

      // Update store profile fields
      store.store_name = store_name;
      store.store_description = store_description;
      if (store_image) store.store_image = store_image;
      if (business_license) store.business_license = business_license;
      if (tax_id) store.tax_id = tax_id;
      if (proof_of_address) store.proof_of_address = proof_of_address;

      store.account_name = account_name;
      store.account_number = account_number;
      store.bank_name = bank_name;
      store.bank_code = bank_code;
      store.city = city
      store.state = state
      store.pin_code = pin_code
      store.store_about = store_about
      store.store_url = store_url
      store.gst = gst
      store.pan = pan

      // Save updated store profile
      const updatedStore = await storeRepo.save(store);

      res.json({
        store: updatedStore,
        success: true,
        message: "Store profile updated successfully!",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Failed to update store profile",
          success: false,
          message: error.message,
        });
      } else {
        return res.status(500).json({
          error: "Unknown error occurred",
          success: false,
        });
      }
    }
  }
}
