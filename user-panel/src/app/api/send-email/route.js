import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, firstName, lastName, email, phone, date, time, message } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "Missing required form fields." },
        { status: 400 }
      );
    }

    // Retrieve SMTP credentials from environment variables
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const rawPort = process.env.SMTP_PORT;
    const smtpPort = rawPort && !isNaN(parseInt(rawPort, 10)) ? parseInt(rawPort, 10) : 587;
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
    const adminEmail = process.env.ADMIN_EMAIL || smtpUser || "contact@luxorajewelers.com";

    let transporter;

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Fallback test transport using Ethereal if live SMTP credentials are not present in .env
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    let subject = "";
    let htmlContent = "";

    if (type === "appointment") {
      subject = `New Appointment Request from ${firstName} ${lastName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 24px; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #202A4E; margin-top: 0; font-size: 22px;">New Appointment Request</h2>
          <p style="color: #555; font-size: 14px;">You have received a new luxury jewelry appointment booking request.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333; width: 140px;">Full Name:</td><td>${firstName} ${lastName}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td><td>${phone || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Requested Date:</td><td>${date || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Requested Time:</td><td>${time || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Notes/Message:</td><td style="white-space: pre-wrap;">${message || "No notes provided"}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">Luxora Jewelers • Appointment Request System</p>
        </div>
      `;
    } else {
      subject = `New Contact Inquiry from ${firstName} ${lastName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 24px; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #202A4E; margin-top: 0; font-size: 22px;">New Contact Inquiry</h2>
          <p style="color: #555; font-size: 14px;">You have received a new message from the Luxora Jewelers website contact form.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333; width: 140px;">Full Name:</td><td>${firstName} ${lastName}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td><td>${phone || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Message:</td><td style="white-space: pre-wrap;">${message || "No message content"}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">Luxora Jewelers • Customer Care</p>
        </div>
      `;
    }

    const info = await transporter.sendMail({
      from: `"Luxora Jewelers" <${smtpUser || "noreply@luxorajewelers.com"}>`,
      to: adminEmail,
      replyTo: email,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully!",
        messageId: info.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Nodemailer Email Sending Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send email. Please check your SMTP connection and try again.",
      },
      { status: 500 }
    );
  }
}
