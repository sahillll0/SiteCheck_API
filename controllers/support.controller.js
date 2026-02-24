import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendSupportMessage = async (req, res) => {
    const { name, email, issueType, message, siteUrl, subject } = req.body;

    // Support either issueType or subject
    const finalSubject = issueType || subject;

    if (!message || !finalSubject) {
        return res.status(400).json({ message: "Message and Subject/Issue Type are required" });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("Missing email credentials in .env file");
        return res.status(500).json({ message: "Server email configuration missing" });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.SUPPORT_EMAIL,
            replyTo: email, // If user provided email, allow reply to them
            subject: `SiteCheck Support: ${issueType} - ${name || "Anonymous"}`,
            html: `
                <h3>New Support Message</h3>
                <p><strong>From:</strong> ${name || "Anonymous"} (${email || "No email provided"})</p>
                <p><strong>Issue Type:</strong> ${issueType}</p>
                <p><strong>Site URL:</strong> ${siteUrl || "N/A"}</p>
                <hr />
                <h4>Message:</h4>
                <p style="white-space: pre-wrap;">${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Support message sent successfully" });
    } catch (error) {
        console.error("Error sending support email:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};
