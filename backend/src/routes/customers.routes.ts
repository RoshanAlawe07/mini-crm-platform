import express from "express";
import { createCustomer, getCustomers, filterCustomersByRules } from "../controllers/customers.controller";

const router = express.Router();

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer email
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *               total_spend:
 *                 type: number
 *                 description: Total amount spent
 *               last_active:
 *                 type: string
 *                 format: date-time
 *                 description: Last active date
 *               visits_count:
 *                 type: number
 *                 description: Number of visits
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", createCustomer);

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers with pagination and filtering
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *       - in: query
 *         name: spend_gt
 *         schema:
 *           type: number
 *         description: Minimum total spend
 *       - in: query
 *         name: spend_lt
 *         schema:
 *           type: number
 *         description: Maximum total spend
 *       - in: query
 *         name: visits_gt
 *         schema:
 *           type: integer
 *         description: Minimum visits count
 *       - in: query
 *         name: visits_lt
 *         schema:
 *           type: integer
 *         description: Maximum visits count
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getCustomers);

/**
 * @swagger
 * /api/customers/filter-by-rules:
 *   post:
 *     summary: Filter customers by custom rules
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: object
 *                 description: Custom filtering rules
 *     responses:
 *       200:
 *         description: Filtered customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/filter-by-rules", filterCustomersByRules);

export default router;
