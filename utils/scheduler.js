import cron from "node-cron";
import prisma from "../db/prisma/db.js";

const removeSessions = () => {
    cron.schedule("*/15 * * * *", async () => {
        try {
            const now = new Date();
            await prisma.session.deleteMany({
                where: { expiresAt: { lt: now } }
            });
            console.log("Expired sessions removed.");
        } catch (error) {
            console.error("Error removing expired sessions:", error);
        }
    });
};

export default removeSessions;
