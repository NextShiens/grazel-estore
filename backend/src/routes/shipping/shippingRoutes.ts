import { Router } from "express";
import { pushOrderToShipmozo } from "../../controllers/common/ShippingController";
import { parsing } from "../../config/parseMulter";

const router = Router();

router.post("/push-order", parsing, pushOrderToShipmozo);

export default router;
