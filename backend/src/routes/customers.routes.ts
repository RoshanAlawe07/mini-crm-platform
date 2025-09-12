import express from "express";
import { createCustomer, getCustomers, filterCustomersByRules } from "../controllers/customers.controller";

const router = express.Router();

router.post("/", createCustomer);
router.get("/", getCustomers);
router.post("/filter-by-rules", filterCustomersByRules);

export default router;
