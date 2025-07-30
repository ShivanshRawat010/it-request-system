const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./backend/.env" });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendFinalMailToIT = async (request) => {
  const {
    name,
    employeeCode,
    designation,
    department,
    location,
    specialAllowance,
    item,
    reason,
    status,
    email,
    contactNumber,
    alternateContactNumber,
    address,
  } = request;

  console.log("sendFinalMailToIT called with request:", request);

  const isApproved =
    status.hr === "approved" &&
    status.hod === "approved" &&
    status.ithod === "approved";
  const finalStatus = isApproved ? "APPROVED ✅" : "REJECTED ❌";
  const statusColor = isApproved ? "#4CAF50" : "#f44336";

  // Determine rejection level and reason if rejected
  let rejectionDetails = '';
  if (!isApproved) {
    const rejectionLevel = 
      status.hod === "rejected" ? "HOD" :
      status.hr === "rejected" ? "HR" :
      "IT Head";
    
    rejectionDetails = `
      <tr style="background: #fff8f8;">
        <th align="left" style="padding: 10px; color: #f44336;">❌ Rejected By</th>
        <td style="padding: 10px; color: #f44336; font-weight: bold;">${rejectionLevel}</td>
      </tr>
    `;
  }

  // Common email template parts
  const commonHTML = `
    <div style="font-family: 'Segoe UI', sans-serif; background: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
          ${isApproved ? '📋 Request Approved' : '❌ Request Rejected'}
        </h2>
        <p style="font-size: 16px; color: #444;">
          The request submitted by <strong>${name}</strong> has been
          <span style="color: ${statusColor}; font-weight: bold;">${finalStatus}</span>
          ${!isApproved ? 'during the approval process' : ''}.
        </p>

        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr style="background: #f0f0f0;">
            <th align="left" style="padding: 10px;">👤 Name</th>
            <td style="padding: 10px;">${name}</td>
          </tr>
          <tr>
            <th align="left" style="padding: 10px;">🆔 Employee Code</th>
            <td style="padding: 10px;">${employeeCode}</td>
          </tr>
          <tr style="background: #f0f0f0;">
            <th align="left" style="padding: 10px;">💼 Designation</th>
            <td style="padding: 10px;">${designation}</td>
          </tr>
          <tr>
            <th align="left" style="padding: 10px;">🏢 Department</th>
            <td style="padding: 10px;">${department}</td>
          </tr>
          <tr style="background: #f0f0f0;">
            <th align="left" style="padding: 10px;">🖥️ Requested Item</th>
            <td style="padding: 10px;">${item}</td>
          </tr>
          <tr>
            <th align="left" style="padding: 10px;">📝 Reason</th>
            <td style="padding: 10px;">${reason || 'Not specified'}</td>
          </tr>
          <tr style="background: #f0f0f0;">
            <th align="left" style="padding: 10px;">📍 Location</th>
            <td style="padding: 10px;">${location}</td>
          </tr>
          <tr>
            <th align="left" style="padding: 10px;">📝 Contact</th>
            <td style="padding: 10px;">${contactNumber}</td>
          </tr>
           <tr style="background: #f0f0f0;">
            <th align="left" style="padding: 10px;">📝 Alternate Contact</th>
            <td style="padding: 10px;">${alternateContactNumber}</td>
          </tr>
          <tr>
            <th align="left" style="padding: 10px;">📝 Address</th>
            <td style="padding: 10px;">${address || 'Not specified'}</td>
          </tr>
          ${rejectionDetails}
          <tr style="background: #f0f0f0;">
            <th align="left" style="padding: 10px;">📌 Final Status</th>
            <td style="padding: 10px; color: ${statusColor}; font-weight: bold;">${finalStatus}</td>
          </tr>
        </table>
  `;

  // Mail to IT Team
  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_IT,
    subject: `🔔 ${isApproved ? 'Approved' : 'Rejected'}: IT Request from ${name} (${employeeCode})`,
    html: commonHTML + `
        <p style="margin-top: 25px; font-size: 15px; color: #555;">
          ${isApproved ? 
            '👉 Please proceed with the necessary action.' : 
            '👉 No further action required.'}
        </p>
        <p style="margin-top: 30px; font-size: 13px; color: #888;">— IT Request System</p>
      </div>
    </div>
    `,
  };

  // Mail to User
  const mailOptionsToUser = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🔔 Your IT Request has been ${isApproved ? 'Approved' : 'Rejected'}`,
    html: commonHTML + `
        <p style="margin-top: 25px; font-size: 15px; color: #555;">
          ${isApproved ? 
            '👉 The IT department will contact you regarding the next steps.' : 
            '👉 Please contact your department head if you need clarification.'}
        </p>
        ${!isApproved ? `
        <div style="margin-top: 20px; padding: 15px; background: #fff8f8; border-left: 4px solid #f44336;">
          <p style="margin: 0; color: #d32f2f;">
            <strong>Note:</strong> If you believe this was rejected in error, please discuss with your ${status.hod === "rejected" ? "HOD" : status.hr === "rejected" ? "HR" : "IT Head"}.
          </p>
        </div>
        ` : ''}
        <p style="margin-top: 30px; font-size: 13px; color: #888;">— IT Request System</p>
      </div>
    </div>
    `,
  };

  await Promise.all([
    transporter.sendMail(mailOptionsToUser),
    transporter.sendMail(mailOptions),
  ]);
};

module.exports = sendFinalMailToIT;