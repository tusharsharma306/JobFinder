//jobController.js
import mongoose from "mongoose";
import Jobs from "../models/jobsModel.js";
import Companies from "../models/companiesModel.js";
import Users from "../models/userModel.js";

export const createJob = async (req, res, next) => {
  try {
    const {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      desc,
      requirements,
      deadline,
      skills
    } = req.body;

    if (
      !jobTitle ||
      !jobType ||
      !location ||
      !salary ||
      !desc ||
      !requirements ||
      !deadline
    ) {
      next("Please provide all required fields");
      return;
    }

    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send(`No Company with id: ${id}`);
    }

    const jobPost = {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      detail: { desc, requirements },
      deadline: new Date(deadline),
      skills: skills || [],
      company: id,
    };

    const job = new Jobs(jobPost);
    await job.save();

    const company = await Companies.findById(id);
    company.jobPosts.push(job._id);

    await company.save();

    res.status(201).json({
      success: true,
      message: "Job Posted Successfully",
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      desc,
      requirements,
      deadline,
      skills  
    } = req.body;
    const { jobId } = req.params;

    if (
      !jobTitle ||
      !jobType ||
      !location ||
      !salary ||
      !desc ||
      !requirements ||
      !deadline ||
      !skills
    ) {
      next("Please Provide All Required Fields");
      return;
    }
    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const jobPost = {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      detail: { desc, requirements },
      deadline,
      skills,
      _id: jobId,
    };

    await Jobs.findByIdAndUpdate(jobId, jobPost, { new: true });

    res.status(200).json({
      success: true,
      message: "Job Post Updated SUccessfully",
      jobPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getJobPosts = async (req, res, next) => {
  try {
    const { 
      search, 
      sort, 
      location, 
      jType, 
      exp,
      skills,
      page = 1,
      limit = 20,
      isActive,
      deadline 
    } = req.query;

    const {user} = req.body;
    let queryObject = {};

if (user?.accountType === "company") {
  queryObject.company = user.userId;
} else {
  queryObject.deadline = { $gt: new Date() };
}

    // Basic filters
    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    if (jType) {
      const types = jType.split(",");
      queryObject.jobType = { $in: types };
    }

    if (exp) {
      const [min, max] = exp.split("-").map(Number);
      queryObject.experience = {
        $gte: min,
        $lte: max
      };
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(",");
      queryObject.skills = { $in: skillsArray };
    }

    // Active/Inactive jobs
    if (isActive !== undefined) {
      queryObject.isActive = isActive === 'true';
    }

    // Deadline filter
    if (deadline) {
      queryObject.deadline = { $gte: new Date() };
    }

    // Search functionality
    if (search) {
      queryObject.$or = [
        { jobTitle: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { jobType: { $regex: search, $options: "i" } },
      ];
    }

    let queryResult = Jobs.find(queryObject)
      .populate({
        path: "company",
        select: "-password"
      });

    // Sorting
    switch (sort) {
      case "Newest":
        queryResult = queryResult.sort("-createdAt");
        break;
      case "Oldest":
        queryResult = queryResult.sort("createdAt");
        break;
      case "A-Z":
        queryResult = queryResult.sort("jobTitle");
        break;
      case "Z-A":
        queryResult = queryResult.sort("-jobTitle");
        break;
      case "Most Applications":
        queryResult = queryResult.sort("-applicationCount");
        break;
      case "Salary High":
        queryResult = queryResult.sort("-salary");
        break;
      case "Salary Low":
        queryResult = queryResult.sort("salary");
        break;
      default:
        queryResult = queryResult.sort("-createdAt");
    }

    // Pagination
    const skip = (page - 1) * limit;
    const totalJobs = await Jobs.countDocuments(queryObject);
    const numOfPage = Math.ceil(totalJobs / limit);

    queryResult = queryResult.skip(skip).limit(limit);

    const jobs = await queryResult;

    res.status(200).json({
      success: true,
      totalJobs,
      data: jobs,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Jobs.findById({ _id: id }).populate({
      path: "company",
      select: "-password",
    });

    if (!job) {
      return res.status(200).send({
        message: "Job Post Not Found",
        success: false,
      });
    }

    //GET SIMILAR JOB POST
    const searchQuery = {
      $or: [
        { jobTitle: { $regex: job?.jobTitle, $options: "i" } },
        { jobType: { $regex: job?.jobType, $options: "i" } },
      ],
    };

    let queryResult = Jobs.find(searchQuery)
      .populate({
        path: "company",
        select: "-password",
      })
      .sort({ _id: -1 });

    queryResult = queryResult.limit(6);
    const similarJobs = await queryResult;

    res.status(200).json({
      success: true,
      data: job,
      similarJobs,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const deleteJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Jobs.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Job Post Delted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const applyJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.body.user.userId;

    const user = await Users.findById(userId).select('+cvUrl');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cvUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume before applying"
      });
    }

    const job = await Jobs.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const alreadyApplied = job.applications.some(
      app => app.user.toString() === userId
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job"
      });
    }

    const application = {
      user: userId,
      status: "pending",
      resumeUrl: user.cvUrl, 
      appliedDate: new Date()
    };

    console.log('Creating application with resume:', application);

    job.applications.push(application);
    await job.save();

    if (!user.appliedJobs.includes(id)) {
      user.appliedJobs.push(id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Application submitted successfully"
    });

  } catch (error) {
    console.error("Error in apply job:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { jobId, userId, status } = req.body;
    const companyId = req.body.user.userId;

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const job = await Jobs.findOne({ 
      _id: jobId,
      company: companyId 
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    const application = job.applications.find(
      app => app.user.toString() === userId
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: {
        status: application.status,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { skills, status, sort, search } = req.query;
    const companyId = req.body.user.userId;

    const job = await Jobs.findById(jobId)
      .populate({
        path: "applications.user",
        select: "firstName lastName email profileUrl cvUrl jobTitle skills"
      });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== companyId) {
      return res.status(403).json({ message: "Unauthorized to view applicants" });
    }

    let applicants = job.applications.map(app => ({
      _id: app._id,
      status: app.status,
      appliedDate: app.appliedDate,
      resumeUrl: app.resumeUrl || app.user.cvUrl, 
      user: {
        _id: app.user._id,
        firstName: app.user.firstName,
        lastName: app.user.lastName,
        email: app.user.email,
        jobTitle: app.user.jobTitle,
        skills: app.user.skills || [],
        profileUrl: app.user.profileUrl
      }
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      applicants = applicants.filter(app => {
        const fullName = `${app.user.firstName} ${app.user.lastName}`.toLowerCase();
        return fullName.includes(searchLower);
      });
    }

    if (skills) {
      const skillsArray = skills.toLowerCase().split(',');
      applicants = applicants.filter(app => 
        app.user.skills?.some(skill => 
          skillsArray.includes(skill.toLowerCase())
        )
      );
    }

    if (status) {
      applicants = applicants.filter(app => app.status === status);
    }

    if (sort === 'date') {
      applicants.sort((a, b) => 
        new Date(b.appliedDate) - new Date(a.appliedDate)
      );
    }

    console.log("Sending applicants data:", JSON.stringify(applicants, null, 2));

    res.status(200).json({
      success: true,
      data: applicants
    });

  } catch (error) {
    console.error("Error in getJobApplicants:", error);
    res.status(500).json({ message: error.message });
  }
};



