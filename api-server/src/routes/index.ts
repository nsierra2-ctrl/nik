import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import adminRouter from "./admin";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import siteSettingsRouter from "./siteSettings";
import { requireAdmin } from "../middlewares/admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(siteSettingsRouter);

// Protect upload-url generation behind admin auth (only the upload endpoint).
router.use("/storage/uploads", requireAdmin);
router.use(storageRouter);

export default router;
