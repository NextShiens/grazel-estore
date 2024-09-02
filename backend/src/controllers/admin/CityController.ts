import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { City } from "../../entities/City";
import { State } from "../../entities/State";
import { validationResult } from "express-validator";

export class CityController {
  // Create a new city
  async create(req: Request, res: Response): Promise<Response> {
    try {
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
  
        return res.status(400).json({
          success: false,
          message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
          errors: formattedErrors,
        });
      }
  
      const { name, state_id } = req.body;
      const cityRepository = appDataSource.getRepository(City);
      const stateRepository = appDataSource.getRepository(State);
  
      // Check if the state exists
      const state = await stateRepository.findOne({
        where: { id: state_id },
      });
  
      if (!state) {
        return res.status(404).json({
          success: false,
          message: "State not found.",
        });
      }
  
      // Check if a city with the same name already exists in the given state
      const existingCity = await cityRepository.findOne({
        where: {
          name: name,
          state: state,
        },
      });
  
      if (existingCity) {
        return res.status(409).json({
          success: false,
          message: "City with this name already exists in the state.",
        });
      }
  
      const city = cityRepository.create({ name, state });
      await cityRepository.save(city);
  
      return res.status(201).json({
        success: true,
        message: "City created successfully.",
        data: city,
      });
    } catch (error: any) {
      console.error("Error creating city:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the city.",
        error: error.message,
      });
    }
  }
  

  // Get all cities
  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const cityRepository = appDataSource.getRepository(City);
      const cities = await cityRepository.find({ relations: ["state"] });

      return res.status(200).json({
        success: true,
        data: cities,
      });
    } catch (error: any) {
      console.error("Error fetching cities:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching cities.",
        error: error.message,
      });
    }
  }

  // Get a single city by ID
  async findOne(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const cityRepository = appDataSource.getRepository(City);
      const city = await cityRepository.findOne({
        where: {
          id: parseInt(id),
        },
        relations: ["state"],
      });

      if (!city) {
        return res.status(404).json({
          success: false,
          message: "City not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: city,
      });
    } catch (error: any) {
      console.error("Error fetching city:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the city.",
        error: error.message,
      });
    }
  }

  // Update a city
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, stateId } = req.body;
      const cityRepository = appDataSource.getRepository(City);
      const stateRepository = appDataSource.getRepository(State);

      const city = await cityRepository.findOne({
        where: {
          id: parseInt(id),
        },
      });

      if (!city) {
        return res.status(404).json({
          success: false,
          message: "City not found.",
        });
      }

      if (stateId) {
        const state = await stateRepository.findOne(stateId);
        if (!state) {
          return res.status(404).json({
            success: false,
            message: "State not found.",
          });
        }
        city.state = state;
      }

      city.name = name;
      await cityRepository.save(city);

      return res.status(200).json({
        success: true,
        message: "City updated successfully.",
        data: city,
      });
    } catch (error: any) {
      console.error("Error updating city:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the city.",
        error: error.message,
      });
    }
  }

  // Delete a city
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const cityRepository = appDataSource.getRepository(City);
      const city = await cityRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!city) {
        return res.status(404).json({
          success: false,
          message: "City not found.",
        });
      }

      await cityRepository.remove(city);

      return res.status(200).json({
        success: true,
        message: "City deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting city:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the city.",
        error: error.message,
      });
    }
  }

  async findByState(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const cityRepository = appDataSource.getRepository(City);

      const cities = await cityRepository.find({
        where: { state: { id: parseInt(id) } },
        relations: ["state"],
      });

      if (cities.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No cities found for the given state ID.",
        });
      }

      return res.status(200).json({
        success: true,
        data: cities,
      });
    } catch (error: any) {
      console.error("Error fetching cities by state:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching cities by state.",
        error: error.message,
      });
    }
  }
}
