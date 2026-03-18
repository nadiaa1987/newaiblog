import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const blogger = {
  async publishToBlogger(
    bloggerEmail: string,
    title: string,
    content: string,
    labels: string[] = []
  ) {
    try {
      const mailOptions = {
        from: SMTP_USER,
        to: bloggerEmail,
        subject: title,
        html: `
          ${content}
          <br><br>
          ${labels.length > 0 ? `<p>Labels: ${labels.join(", ")}</p>` : ""}
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully to Blogger:", info.response);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Blogger Email-to-Post Error:", error);
      throw error;
    }
  },
};
