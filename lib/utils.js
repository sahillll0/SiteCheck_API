import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECREAT, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "none", // Required for cross-site cookies (Localhost -> Vercel)
        secure: true, // Required for sameSite: "none"
    });

    return token;
};
