import { Router, type IRouter } from "express";
import healthRouter from "./health";
import siteAccessRouter from "./site-access";

const router: IRouter = Router();

router.use(healthRouter);
router.use(siteAccessRouter);

export default router;
