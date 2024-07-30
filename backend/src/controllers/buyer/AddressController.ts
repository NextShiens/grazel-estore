import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Address } from "../../entities/Address";
import { validationResult } from "express-validator";

const omitTimestamps = (address: Address) => {
  const { created_at, updated_at, ...rest } = address;
  return rest;
};

export class AddressController {
  async getAll(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const addressRepo = appDataSource.getRepository(Address);
      const addresses = await addressRepo.find({
        where: { user_id: user.id },
      });

      const addressesWithoutTimestamps = addresses.map(omitTimestamps);

      return res.json({
        addresses: addressesWithoutTimestamps,
        success: true,
        message: "All addresses fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const addressRepo = appDataSource.getRepository(Address);
      const address = await addressRepo.findOne({ where: { id: parsedId } });

      if (!address) {
        return res.status(404).json({
          error: "Address not found",
          success: false,
          message: "Address not found with the provided ID",
        });
      }

      res.status(200).json({
        address: omitTimestamps(address),
        success: true,
        message: "Address Details fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch address" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;

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

      const { address, address_label, note, recipient_name, recipient_phone } =
        req.body;

      const userId = user.id;

      const addressRepo = appDataSource.getRepository(Address);
      const existingAddress = await addressRepo.findOne({
        where: { address },
      });

      if (existingAddress) {
        return res.status(400).json({
          success: false,
          message: "Address with this name already exists",
        });
      }

      const newAddress = new Address();

      newAddress.user_id = userId;
      newAddress.address = address;
      newAddress.address_label = address_label;
      newAddress.note = note;
      newAddress.recipient_name = recipient_name;
      newAddress.recipient_phone = recipient_phone;

      const createdAddress = await addressRepo.save(newAddress);
      res.status(201).json({
        address: omitTimestamps(createdAddress),
        success: true,
        message: "Address created successfully!",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          error: "Failed to create address",
          message: error.message,
        });
      } else {
        return res
          .status(500)
          .json({ success: false, error: "Unknown error occurred" });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);

      const { address, address_label, note, recipient_name, recipient_phone } =
        req.body;

      // const { name, active, description } = req.body;
      const addressRepo = appDataSource.getRepository(Address);
      const existingAddress = await addressRepo.findOne({
        where: { id: parsedId },
      });

      if (!existingAddress) {
        return res.status(404).json({
          error: "Address not found",
          success: false,
          message: "Address not found with the provided ID",
        });
      }

      if (address) {
        existingAddress.address = address;
      }
      if (address_label) {
        existingAddress.address_label = address_label;
      }
      if (note) {
        existingAddress.note = note;
      }

      if (recipient_name) {
        existingAddress.recipient_name = recipient_name;
      }

      if (recipient_phone) {
        existingAddress.recipient_phone = recipient_phone;
      }

      const updatedAddress = await addressRepo.save(existingAddress);
      res.json({
        address: omitTimestamps(updatedAddress),
        success: true,
        message: "Address updated successfully!",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Failed to update address",
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

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const addressRepo = appDataSource.getRepository(Address);
      const address = await addressRepo.findOne({ where: { id: parsedId } });

      if (!address) {
        return res.status(404).json({
          error: "Address not found",
          success: false,
          message: "Address not found with the provided ID",
        });
      }

      await addressRepo.remove(address);
      res.json({
        success: true,
        message: "Address deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete address" });
    }
  }

  async setPrimaryAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = (req as any).user;
      const userId = user.id;
      const parsedId = parseInt(id, 10);

      const addressRepo = appDataSource.getRepository(Address);

      // Find the address by ID
      const address = await addressRepo.findOne({
        where: { id: parsedId, user_id: userId },
      });

      if (!address) {
        return res.status(404).json({
          error: "Address not found",
          success: false,
          message: "Address not found with the provided ID",
        });
      }

      // Set all addresses of the user to primary_location: false
      await addressRepo.update(
        { user_id: userId },
        { primary_location: false }
      );

      // Set the selected address to primary_location: true
      address.primary_location = true;
      const updatedAddress = await addressRepo.save(address);

      res.status(200).json({
        address: omitTimestamps(updatedAddress),
        success: true,
        message: "Primary address set successfully!",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Failed to set primary address",
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
