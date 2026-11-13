import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getReceivedFriendRequests,
    getSentFriendRequests,
    getFriends,
    removeFriend
} from "../controllers/friend.controller.js";

const router = express.Router();

// Routes pour les demandes d'amis
router.post("/request", protectRoute, sendFriendRequest);
router.post("/request/:requestId/accept", protectRoute, acceptFriendRequest);
router.post("/request/:requestId/decline", protectRoute, declineFriendRequest);

// Routes pour obtenir les demandes d'amis
router.get("/requests/received", protectRoute, getReceivedFriendRequests);
router.get("/requests/sent", protectRoute, getSentFriendRequests);

// Routes pour les amis
router.get("/", protectRoute, getFriends);
router.delete("/:friendId", protectRoute, removeFriend);

export default router;