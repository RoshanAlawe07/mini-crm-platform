import express from "express";
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrder, 
  deleteOrder 
} from "../controllers/orders.controller";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
