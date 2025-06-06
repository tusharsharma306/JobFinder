import express from "express";
import userAuth from "../middlewares/authMiddleware.js";
import {
  createJob,
  deleteJobPost,
  getJobById,
  getJobPosts,
  updateJob,
  getJobApplicants,
  applyJob,
  updateApplicationStatus,
} from "../controllers/jobController.js";

const router = express.Router();

// GET JOB POSTS
router.get("/find-jobs", getJobPosts); // Fix: Changed from /find-jobs to /

// Other routes
router.post("/upload-job", userAuth, createJob);
router.put("/update-job/:jobId", userAuth, updateJob);
router.get("/get-job-detail/:id", getJobById);
router.delete("/delete-job/:id", userAuth, deleteJobPost);
router.get("/applicants/:jobId", userAuth, getJobApplicants);
router.post("/apply-jobs/:id", userAuth, applyJob);
router.put("/update-application-status", userAuth, updateApplicationStatus);

export default router;