import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);
      
      req.body.user = {
        userId: decoded.userId,
        accountType: decoded.accountType 
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token has expired" });
      }
      return res.status(401).json({ message: "Invalid or malformed token" });
    }
  } catch (error) {
    console.error("Authentication Middleware Error:", error);
    return res.status(500).json({ message: "Server error during authentication" });
  }
};

export default userAuth;
