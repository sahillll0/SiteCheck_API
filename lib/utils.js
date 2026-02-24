import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    console.log("Generating token for user:", userId);
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: "none", // Required for cross-origin (port 5173 -> port 8001)
        secure: true, // Browsers allow secure:true on localhost
    });
    console.log("Cookie 'jwt' set in response headers");

    return token;
};



