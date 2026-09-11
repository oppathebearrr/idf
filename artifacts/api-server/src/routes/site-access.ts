import { timingSafeEqual } from "node:crypto";
import { Router, type IRouter } from "express";

const router: IRouter = Router();
const ACCESS_COOKIE_NAME = "cyber_safety_access";
const ACCESS_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

function valuesMatch(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

router.post("/site-access/unlock", (req, res) => {
  const configuredAgentName = process.env["AGENT_NAME"];
  const configuredEmployeeId = process.env["EMPLOYEE_ID"];

  if (!configuredAgentName || !configuredEmployeeId) {
    res.status(503).json({
      success: false,
      message: "Website access is not configured.",
    });
    return;
  }

  const agentName =
    typeof req.body?.agentName === "string" ? req.body.agentName : "";
  const employeeId =
    typeof req.body?.employeeId === "string" ? req.body.employeeId : "";

  const isValid =
    valuesMatch(agentName, configuredAgentName) &&
    valuesMatch(employeeId, configuredEmployeeId);

  if (!isValid) {
    res.status(401).json({
      success: false,
      message: "The agent name or employee ID is incorrect.",
    });
    return;
  }

  res.cookie(ACCESS_COOKIE_NAME, "granted", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: ACCESS_COOKIE_MAX_AGE,
    path: "/",
  });
  res.json({ success: true });
});

router.get("/site-access/status", (req, res) => {
  const isUnlocked = req.signedCookies?.[ACCESS_COOKIE_NAME] === "granted";
  res.json({ unlocked: isUnlocked });
});

export default router;