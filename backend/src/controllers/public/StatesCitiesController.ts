import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { State } from "../../entities/State";
import { City } from "../../entities/City";

export class StatesCitiesController {
  // Get all states
  async findAllStates(req: Request, res: Response) {
    try {
      const stateRepository = appDataSource.getRepository(State);
      const states = await stateRepository.find();

      return res.status(200).json({
        success: true,
        data: states,
      });
    } catch (error: any) {
      console.error("Error fetching states:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching states.",
        error: error.message,
      });
    }
  }

  // Get a single state by ID
  async findOneState(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stateRepository = appDataSource.getRepository(State);
      const state = await stateRepository.findOne({
        where: {
          id: parseInt(id),
        },
      });

      if (!state) {
        return res.status(404).json({
          success: false,
          message: "State not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: state,
      });
    } catch (error: any) {
      console.error("Error fetching state:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the state.",
        error: error.message,
      });
    }
  }

  // Get all cities
  async findAllCities(req: Request, res: Response): Promise<Response> {
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
  async findOneCity(req: Request, res: Response): Promise<Response> {
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

  async findCitiesByState(req: Request, res: Response): Promise<Response> {
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
