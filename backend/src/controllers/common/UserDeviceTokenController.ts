import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { UserDeviceToken } from "../../entities/UserDeviceToken";
import { validationResult } from "express-validator";

// TokenService class
class TokenService {
  private tokenRepository = appDataSource.getRepository(UserDeviceToken);

  async saveToken(user_id: string, token: string): Promise<void> {
    let userToken = await this.tokenRepository.findOne({ where: { user_id } });

    if (userToken) {
      userToken.device_token = token;
      userToken.updated_at = new Date();
    } else {
      userToken = this.tokenRepository.create({ user_id, device_token: token });
    }

    await this.tokenRepository.save(userToken);
  }

  async getToken(user_id: string): Promise<string | null> {
    const userToken = await this.tokenRepository.findOne({
      where: { user_id },
    });
    return userToken ? userToken.device_token : null;
  }
}
export class TokenController {
  private static tokenService = new TokenService(); // Static property

  static async saveDeviceToken(req: Request, res: Response) {
    const { token, user_id } = req.body;

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

    try {
      await TokenController.tokenService.saveToken(user_id, token); // Access static property
      res.status(200).send({ success: true });
    } catch (error: any) {
      res.status(500).send({ success: false, error: error.message });
    }
  }

  static async getDeviceToken(req: Request, res: Response): Promise<void> {
    const { user_id } = req.params;

    try {
      const token = await TokenController.tokenService.getToken(user_id); // Access static property
      if (token) {
        res.status(200).send({ token });
      } else {
        res.status(404).send({ success: false, message: "Token not found" });
      }
    } catch (error: any) {
      res.status(500).send({ success: false, error: error.message });
    }
  }
}
