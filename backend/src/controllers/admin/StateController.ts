import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { State } from "../../entities/State";
import { validationResult } from "express-validator";

export class StateController {
  // Create a new state
  async create(req: Request, res: Response) {
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
     
             const errorResponse = {
               success: false,
               message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
               errors: formattedErrors,
             };
     
             return res.status(400).json(errorResponse);
           }
     

      const { name } = req.body;
      const stateRepository = appDataSource.getRepository(State);

      // Check if a state with the same name already exists
      const existingState = await stateRepository.findOne({
        where: {
          name: name,
        },
      });

      if (existingState) {
        return res.status(409).json({
          success: false,
          message: "State with this name already exists.",
        });
      }

      const state = stateRepository.create({ name });
      await stateRepository.save(state);

      return res.status(201).json({
        success: true,
        message: "State created successfully.",
        data: state,
      });
    } catch (error: any) {
      console.error("Error creating state:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the state.",
        error: error.message,
      });
    }
  }

  // Get all states
  async findAll(req: Request, res: Response) {
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
  async findOne(req: Request, res: Response) {
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

  // Update a state
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
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

      state.name = name;
      await stateRepository.save(state);

      return res.status(200).json({
        success: true,
        message: "State updated successfully.",
        data: state,
      });
    } catch (error: any) {
      console.error("Error updating state:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the state.",
        error: error.message,
      });
    }
  }

  // Delete a state
  async delete(req: Request, res: Response) {
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

      await stateRepository.remove(state);

      return res.status(200).json({
        success: true,
        message: "State deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting state:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the state.",
        error: error.message,
      });
    }
  }
}
