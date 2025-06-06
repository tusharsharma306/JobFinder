import express from "express";
import userAuth from "../middlewares/authMiddleware.js";
import upload from '../utils/multerConfig.js';
import { getUser, updateUser, getUserApplications } from "../controllers/userController.js";

const router = express.Router();


console.log("Setting up user routes");

router.post("/get-user", userAuth, getUser);

router.put("/update-user", 
  userAuth, 
  upload.single('resume'), 
  updateUser
);


router.get("/applied-jobs", userAuth, getUserApplications);



export default router;
