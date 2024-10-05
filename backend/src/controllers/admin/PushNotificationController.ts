import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { UserDeviceToken } from "../../entities/UserDeviceToken";
import { Notification } from "../../entities/Notification";
import { sendPushNotifications } from "../../services/notificationService";
import { validationResult } from "express-validator";

export const sendAdminNotification = async (req: Request, res: Response) => {
  const { title, body, data, thumbnail, url } = req.body;

  // Validation Error Handling
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const result = errors.mapped();

    const formattedErrors: Record<string, string[]> = {};
    for (const key in result) {
      formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
        result[key].msg,
      ];
    }

    const errorCount = Object.keys(result).length;
    const errorSuffix =
      errorCount > 1
        ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
        : "";

    const errorResponse = {
      success: false,
      message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
      errors: formattedErrors,
    };

    return res.status(400).json(errorResponse);
  }

  const deviceTokenRepo = appDataSource.getRepository(UserDeviceToken);
  const notificationRepo = appDataSource.getRepository(Notification);

  try {
    // Find all device tokens

    const newNotification = new Notification();
    newNotification.title = title;
    newNotification.body = body;
    newNotification.image = thumbnail;
    newNotification.url = url;
    newNotification.data = data;

    // const createdNotification = await notificationRepo.save(newNotification);

    const deviceTokenRecords = await deviceTokenRepo.find();
    const tokens: string[] = deviceTokenRecords.map(
      (record) => record.device_token
    );

    if (tokens.length > 0) {
      await sendPushNotifications(tokens, title, body, data, thumbnail, url);
      const createdNotification = await notificationRepo.save(newNotification);

      res.status(200).json({
        success: true,
        message: "Notifications sent and saved successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No device tokens found",
      });
    }
  } catch (error) {
    console.error(
      "Error fetching device tokens, creating notifications, or sending notifications:",
      error
    );
    res.status(500).json({ message: "Failed to send notifications", error });
  }
};
