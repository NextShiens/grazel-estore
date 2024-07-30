import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { User } from "../../entities/Users";
import { NotificationSettings } from "../../entities/NotificationSettings";

export class NotificationController {
  // Update user notification settings method
  // async updateUserNotificationSettings(req: Request, res: Response) {
  //   const { id } = req.params;
  //   const { email, offer_and_promotion, newsletter, personalized } = req.body;

  //   try {
  //     const userRepository = appDataSource.getRepository(User);
  //     const notificationRepository =
  //       appDataSource.getRepository(NotificationSettings);

  //     const user = await userRepository.findOneOrFail({
  //       where: { id: Number(id) },
  //       relations: ["notification_settings"],
  //     });

  //     let notificationSettings = user.notification_settings;
  //     if (!notificationSettings) {
  //       notificationSettings = new NotificationSettings();
  //       notificationSettings.user = user;
  //       notificationSettings.user_id = user.id;
  //     }

  //     // Update only provided fields
  //     if (email !== undefined) {
  //       notificationSettings.email = Boolean(email);
  //     }
  //     if (offer_and_promotion !== undefined) {
  //       notificationSettings.offer_and_promotion = Boolean(offer_and_promotion);
  //     }
  //     if (newsletter !== undefined) {
  //       notificationSettings.newsletter = Boolean(newsletter);
  //     }
  //     if (personalized !== undefined) {
  //       notificationSettings.personalized = Boolean(personalized);
  //     }

  //     await notificationRepository.save(notificationSettings);

  //     // Prepare response without sensitive fields
  //     const {
  //       password,
  //       created_at,
  //       updated_at,
  //       active,
  //       score,
  //       is_deleted,
  //       ...userWithoutSensitiveFields
  //     } = user;
  //     const responseUser = {
  //       ...userWithoutSensitiveFields,
  //       notification_settings: notificationSettings,
  //     };

  //     res.status(200).json({
  //       message: "Notification settings updated successfully",
  //       user: responseUser,
  //     });
  //   } catch (error) {
  //     console.error("Error updating notification settings:", error);
  //     res.status(500).json({ error: "Failed to update notification settings" });
  //   }
  // }

  // async updateUserNotificationSettings(req: Request, res: Response) {
  //   const { id } = req.params;
  //   const { email, offer_and_promotion, newsletter, personalized } = req.body;

  //   try {
  //     const userRepository = appDataSource.getRepository(User);
  //     const notificationRepository =
  //       appDataSource.getRepository(NotificationSettings);

  //     const user = await userRepository.findOneOrFail({
  //       where: { id: Number(id) },
  //       relations: ["notification_settings"],
  //     });

  //     let notificationSettings = user.notification_settings;
  //     if (!notificationSettings) {
  //       notificationSettings = new NotificationSettings();
  //       notificationSettings.user = user;
  //       notificationSettings.user_id = user.id;
  //     }

  //     // Update only provided fields
  //     if (email !== undefined) {
  //       notificationSettings.email = Boolean(email);
  //     }
  //     if (offer_and_promotion !== undefined) {
  //       notificationSettings.offer_and_promotion = Boolean(offer_and_promotion);
  //     }
  //     if (newsletter !== undefined) {
  //       notificationSettings.newsletter = Boolean(newsletter);
  //     }
  //     if (personalized !== undefined) {
  //       notificationSettings.personalized = Boolean(personalized);
  //     }

  //     await notificationRepository.save(notificationSettings);

  //     // Prepare response without sensitive fields
  //     const {
  //       password,
  //       created_at,
  //       updated_at,
  //       active,
  //       score,
  //       is_deleted,
  //       ...userWithoutSensitiveFields
  //     } = user;
  //     const responseUser = {
  //       ...userWithoutSensitiveFields,
  //       notification_settings: notificationSettings,
  //     };

  //     res.status(200).json({
  //       success: true,
  //       message: "Notification settings updated successfully",
  //       user: responseUser,
  //     });
  //   } catch (error) {
  //     console.error("Error updating notification settings:", error);
  //     res.status(500).json({ error: "Failed to update notification settings" });
  //   }
  // }

  // async updateUserNotificationSettings(req: Request, res: Response) {
  //   const { id } = req.params;
  //   const { email, offer_and_promotion, newsletter, personalized } = req.body;
  
  //   try {
  //     const userRepository = appDataSource.getRepository(User);
  //     const notificationRepository = appDataSource.getRepository(NotificationSettings);
  
  //     const user = await userRepository.findOneOrFail({
  //       where: { id: Number(id) },
  //       relations: ["notification_settings"],
  //     });
  
  //     let notificationSettings = user.notification_settings;
  //     if (!notificationSettings) {
  //       notificationSettings = new NotificationSettings();
  //       notificationSettings.user = user;
  //       notificationSettings.user_id = user.id;
  //     }
  
  //     // Update only provided fields explicitly handling undefined and null values
  //     if (email !== undefined && email !== null) {
  //       notificationSettings.email = Boolean(email);
  //     }
  //     if (offer_and_promotion !== undefined && offer_and_promotion !== null) {
  //       notificationSettings.offer_and_promotion = Boolean(offer_and_promotion);
  //     }
  //     if (newsletter !== undefined && newsletter !== null) {
  //       notificationSettings.newsletter = Boolean(newsletter);
  //     }
  //     if (personalized !== undefined && personalized !== null) {
  //       notificationSettings.personalized = Boolean(personalized);
  //     }
  
  //     await notificationRepository.save(notificationSettings);
  
  //     // Prepare response without sensitive fields
  //     const {
  //       password,
  //       created_at,
  //       updated_at,
  //       active,
  //       score,
  //       is_deleted,
  //       ...userWithoutSensitiveFields
  //     } = user;
  //     const responseUser = {
  //       ...userWithoutSensitiveFields,
  //       notification_settings: notificationSettings,
  //     };
  
  //     res.status(200).json({
  //       message: "Notification settings updated successfully",
  //       user: responseUser,
  //     });
  //   } catch (error) {
  //     console.error("Error updating notification settings:", error);
  //     res.status(500).json({ error: "Failed to update notification settings" });
  //   }
  // }

  async updateUserNotificationSettings(req: Request, res: Response) {
    const { id } = req.params;
    const { email, offer_and_promotion, newsletter, personalized } = req.body;
  
    try {
      const userRepository = appDataSource.getRepository(User);
      const notificationRepository = appDataSource.getRepository(NotificationSettings);
  
      const user = await userRepository.findOneOrFail({
        where: { id: Number(id) },
        relations: ["notification_settings"],
      });
  
      let notificationSettings = user.notification_settings;
      if (!notificationSettings) {
        notificationSettings = new NotificationSettings();
        notificationSettings.user = user;
        notificationSettings.user_id = user.id;
      }
  
      // Update only provided fields explicitly handling 0 and 1 values
      if (email !== undefined && email !== null) {
        notificationSettings.email = Boolean(Number(email));
      }
      if (offer_and_promotion !== undefined && offer_and_promotion !== null) {
        notificationSettings.offer_and_promotion = Boolean(Number(offer_and_promotion));
      }
      if (newsletter !== undefined && newsletter !== null) {
        notificationSettings.newsletter = Boolean(Number(newsletter));
      }
      if (personalized !== undefined && personalized !== null) {
        notificationSettings.personalized = Boolean(Number(personalized));
      }
  
      await notificationRepository.save(notificationSettings);
  
      // Prepare response without sensitive fields
      const {
        password,
        created_at,
        updated_at,
        active,
        score,
        is_deleted,
        ...userWithoutSensitiveFields
      } = user;
      const responseUser = {
        ...userWithoutSensitiveFields,
        notification_settings: notificationSettings,
      };
  
      res.status(200).json({
        success : true ,
        message: "Notification settings updated successfully",
        user: responseUser,
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ error: "Failed to update notification settings" });
    }
  }
  
  

  // Get user notification settings method
  async getUserNotificationSettings(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const userRepository = appDataSource.getRepository(User);

      const user = await userRepository.findOneOrFail({
        where: { id: Number(id) },
        relations: ["notification_settings"],
      });

      const {
        password,
        created_at,
        updated_at,
        active,
        score,
        is_deleted,
        ...userWithoutSensitiveFields
      } = user;
      const responseUser = {
        ...userWithoutSensitiveFields,
        notification_settings: user.notification_settings,
      };

      res.status(200).json({
        success: true,
        message: "Notification settings retrieved successfully",
        user: responseUser,
      });
    } catch (error) {
      console.error("Error retrieving notification settings:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve notification settings" });
    }
  }
}
