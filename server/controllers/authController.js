import Users from "../models/userModel.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;


  if (!firstName || !email || !lastName || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields"
    });
  }


  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      next("Email Address already exists");
      return;
    }

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password,
    });

    await user.save();
    const token = await user.createJWT();

    res.status(201).send({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }


    console.log("Login attempt with email:", email);
    const user = await Users.findOne({ email }).select("+password");

    if (!user) {
      console.log("not found with email:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log("Stored hashed password:", user.password);
    
    

    const isMatch = await user.comparePassword(password);;
    
    console.log("password match result:", isMatch);



    if (!isMatch) {
      console.log("Password does not match for email:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    user.password = undefined;
    
    const token = user.createJWT();

    res.status(201).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(404).json({ message: error.message });
  }
};