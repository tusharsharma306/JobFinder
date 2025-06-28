//companiesController.js
import mongoose from "mongoose";
import Companies from "../models/companiesModel.js";
import Jobs from "../models/jobsModel.js";


export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name) {
    next("Company Name is required!");
    return;
  }
  if (!email) {
    next("Email address is required!");
    return;
  }
  if (!password) {
    next("Password is required and must be greater than 6 characters");
    return;
  }

  try {
    const accountExist = await Companies.findOne({ email });

    if (accountExist) {
      next("Email Already Registered. Please Login");
      return;
    }

    const company = await Companies.create({
      name,
      email,
      password,
    });

    const token = company.createJWT();

    res.status(201).json({
      success: true,
      message: "Company Account Created Successfully",
      user: {
        _id: company._id,
        name: company.name,
        email: company.email,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


// export const signIn = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide email and password"
//       });
//     }

//     // Find company with password
//     const company = await Companies.findOne({ email }).select("+password");
    
//     if (!company) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password"
//       });
//     }
    
//     // Compare password
//     const isMatch = await company.comparePassword(password);


//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password"
//       });
//     }

//     // Remove password from response
//     company.password = undefined;

//     // Generate token
//     const token = company.createJWT();

//     // Send response
//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: company,
//       token,
//     });

//   } catch (error) {
//     console.log("Company login error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error during login"
//     });
//   }
// };


export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const company = await Companies.findOne({ email }).select("+password");
    
    if (!company) {
      console.log("Company not found with email:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await company.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Invalid password for company:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    company.password = undefined;

    const token = company.createJWT();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: company._id,
        name: company.name,
        email: company.email,
        accountType: "company",
        contact: company.contact,
        location: company.location,
        about: company.about,
        profileUrl: company.profileUrl
      },
      token
    });

  } catch (error) {
    console.log("Company login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};


export const updateCompanyProfile = async (req, res, next) => {
  const { name, contact, location, profileUrl, about } = req.body;

  try {
    if (!name || !location || !about || !contact || !profileUrl) {
      next("Please Provide All Required Fields");
      return;
    }

    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const updateCompany = {
      name,
      contact,
      location,
      profileUrl,
      about,
      _id: id,
    };

    const company = await Companies.findByIdAndUpdate(id, updateCompany, {
      new: true,
    });

    const token = company.createJWT();

    company.password = undefined;

    res.status(200).json({
      success: true,
      message: "Company Profile Updated Successfully",
      company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};



export const getCompanyProfile = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const company = await Companies.findById({ _id: id });

    if (!company) {
      return res.status(200).send({
        message: "Company Not Found",
        success: false,
      });
    }

    company.password = undefined;
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const { search, sort, location } = req.query;

    const queryObject = {};

    if (search) {
      queryObject.name = { $regex: search, $options: "i" };
    }

    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    let queryResult = Companies.find(queryObject).select("-password");

    // SORTING
    if (sort === "Newest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "A-Z") {
      queryResult = queryResult.sort("name");
    }
    if (sort === "Z-A") {
      queryResult = queryResult.sort("-name");
    }

    // PADINATIONS
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const total = await Companies.countDocuments(queryResult);
    const numOfPage = Math.ceil(total / limit);
   
    // queryResult = queryResult.skip(skip).limit(limit);

    queryResult = queryResult.limit(limit * page);

    const companies = await queryResult;

    res.status(200).json({
      success: true,
      total,
      data: companies,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};



export const getCompanyJobListing = async (req, res, next) => {
  try {
    // console.log("--- DEBUG START: getCompanyJobListing ---");
    // console.log("Full req.body:", req.body);
    // console.log("Type of req.body.archived:", typeof req.body.archived);
    // console.log("Value of req.body.archived:", req.body.archived);
    const id = req.body.user.userId;
    const { archived } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    const companyObjectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
   
    let isArchivedBool = false;
    if (typeof archived === 'boolean') {
      isArchivedBool = archived;
    } else if (typeof archived === 'string') {
      isArchivedBool = archived === 'true';
    } else if (typeof archived === 'object' && archived !== null && 'value' in archived) {
      isArchivedBool = Boolean(archived.value);
    } else {
      isArchivedBool = Boolean(archived);
    }
    // console.log(`[getCompanyJobListing] Querying jobs for company:`, companyObjectId, 'type:', typeof companyObjectId, 'archived:', isArchivedBool);
    const jobs = await Jobs.find({
      company: companyObjectId,
      isArchived: isArchivedBool
    }).sort({ createdAt: -1 });

    
    // console.log(`[getCompanyJobListing] company: ${companyObjectId}, archived: ${archived}, jobs found: ${jobs.length}`);
    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching job listings"
    });
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Companies.findById({ _id: id }).populate({
      path: "jobPosts",
      options: {
        sort: "-_id",
      },
    });

    if (!company) {
      return res.status(200).send({
        message: "Company Not Found",
        success: false,
      });
    }

    company.password = undefined;

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


