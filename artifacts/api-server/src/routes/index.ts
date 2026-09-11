import { Router, type IRouter } from "express";
import binLookupRouter from "./bin-lookup";
import healthRouter from "./health";
import siteAccessRouter from "./site-access";

const router: IRouter = Router();

router.use(binLookupRouter);
router.use(healthRouter);
router.use(siteAccessRouter);

export default router;
