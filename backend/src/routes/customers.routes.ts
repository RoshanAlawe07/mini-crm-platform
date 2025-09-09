import express from "express";
import { createCustomer, getCustomers } from "../controllers/customers.controller";

const router = express.Router();

router.post("/", createCustomer);
router.get("/", getCustomers);

export default router;
