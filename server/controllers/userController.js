//userController.js
import mongoose from "mongoose";
import Users from "../models/userModel.js";
import { uploadToCloudinary } from '../utils/CloudinaryConfig.js';

export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, contact, location, about, skills } = req.body;
    
    if (!firstName || !lastName || !email || !contact || !location) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const id = req.body.user.userId;
    let parsedSkills;
    try {
      parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    } catch (e) {
      parsedSkills = [];
    }

    const updateData = {
      firstName,
      lastName,
      email,
      contact,
      location,
      about,
      skills: parsedSkills,
      jobTitle: req.body.jobTitle || '',
    };

    // Handle resume upload if file exists
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.buffer);
      if (cloudinaryResponse?.url) {
        updateData.cvUrl = cloudinaryResponse.url;
      }
    } else if (req.body.cvUrl) {
      updateData.cvUrl = req.body.cvUrl;
    }

    const user = await Users.findByIdAndUpdate(
      id, 
      updateData,
      { new: true }
    );

    const token = user.createJWT();
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const user = await Users.findById({ _id: id });

    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const getUserApplications = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid user ID" });
    }

    const user = await Users.findById(id).populate({
      path: "appliedJobs",
      populate: [
        {
          path: "company",
          select: "name location profileUrl"
        },
        {
          path: "applications",
          match: { user: id },
          select: "status appliedDate feedback"
        }
      ],
      select: "jobTitle jobType location salary company applications createdAt deadline detail"
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const formattedApplications = user.appliedJobs.map(job => ({
      ...job.toObject(),
      status: job.applications[0]?.status || "pending",
      appliedDate: job.applications[0]?.appliedDate,
      feedback: job.applications[0]?.feedback,
      detail: job.detail || [{ desc: "No description available" }]
    }));

    res.status(200).json({
      success: true,
      data: formattedApplications
    });
  } catch (error) {
    console.error("Error in get user applications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


