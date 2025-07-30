const Request = require("../models/Request");
const { 
  sendHODMail,
  sendEDMail, 
  sendHRMail, 
  sendITHODMail,
  sendRejectionMail,
  sendApprovalMail,
  sendFinalApprovalMail
} = require("../utils/sendMail");
const sendFinalMailToIT = require("../utils/sendFinalMail");

const submitRequest = async (req, res) => {
  try {
    console.log("📥 Incoming request data:", req.body);
    console.log("Full req.body:", JSON.stringify(req.body));

    const { hodEmail, ithodEmail, requestedBy, item, ...restData } = req.body;
    const username = req.user?.username || 'unknown_user';

    // Initialize status with conditional ED approval
    const status = {
      hod: 'pending',
      hr: 'pending',
      ithod: 'pending',
      it: 'pending',
      ed: item === 'Printer' ? 'pending' : 'approved' // ED approval only for Printer
    };

    const newRequest = new Request({ 
      ...restData, 
      hodEmail,
      ithodEmail,
      requestedBy,
      item,
      username,
      status
    });

    await newRequest.save();
    console.log("✅ Request saved to DB:", newRequest._id);
    console.log("Saved request object:", newRequest);
    console.log("Saved request item:", newRequest.item);

    await sendHODMail({ ...restData, hodEmail, item }, newRequest._id);
    console.log("📧 Email sent to HOD for approval");

    res.status(200).json({ message: "Request submitted" });
  } catch (err) {
    console.error("❌ Error in submitRequest:", err);
    res.status(500).json({ error: "Request submission failed" });
  }
};

const handleApproval = async (req, res) => {
  const { id, type, status } = req.query;

  try {
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).send("Request not found");
    }

    // Check if action has already been taken
    if (request.actionedViaEmail?.[type] || request.status[type] !== "pending") {
      return res.status(400).send(`
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
          <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 40px; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
            <div style="font-size: 50px; margin-bottom: 15px; color: #dc3545;">
              ⚠️
            </div>
            <h2 style="color: #dc3545; margin-bottom: 15px; font-size: 24px; font-weight: 600;">
              Action Already Taken
            </h2>
            <p style="font-size: 16px; color: #555;">
              This request has already been ${request.status[type]} by ${type.toUpperCase()}.
            </p>
            <p style="margin-top: 40px; font-size: 13px; color: #999;">
              No further action can be taken on this request.
            </p>
          </div>
        </div>
      `);
    }

    // Validate the approval sequence
    if (type === "hr" && request.status.hod !== "approved") {
      return res.status(400).send("HOD must approve before HR");
    }
    if (type === "ithod" && request.status.hr !== "approved") {
      return res.status(400).send("HR must approve before ITHOD");
    }
    if (type === "ed") {
      if (request.status.hod !== "approved") {
        return res.status(400).send("HOD must approve before Plant Head");
      }
    }
    if (type === "hr" && request.item === "Printer" && request.status.ed !== "approved") {
      return res.status(400).send("Plant Head must approve before HR for Printer requests");
    }

    // Update the request status and mark as actioned via email
    request.status[type] = status;
    request.actionedViaEmail = request.actionedViaEmail || {};
    request.actionedViaEmail[type] = true;
    await request.save();

    if (status === "approved") {
      // Notify the user about approval at this level
      await sendApprovalMail(request, type);
      
      // Determine next step or final approval
      switch(type) {
        case "hod":
          if (request.item === "Printer") {
            await sendEDMail(request, id);
          } else {
            await sendHRMail(request, id);
          }
          break;
        case "ed":
          await sendHRMail(request, id);
          break;
        case "hr":
          await sendITHODMail(request, id);
          break;
        case "ithod":
          // Check if all approvals are complete
          const allApproved = 
            request.status.hod === "approved" && 
            (request.item === "Printer" ? request.status.ed === "approved" : true) &&
            request.status.hr === "approved" && 
            request.status.ithod === "approved";
            
          if (allApproved) {
            await sendFinalApprovalMail(request);
            await sendFinalMailToIT(request, id);
          }
          break;
      }
    } 
    else if (status === "rejected") {
      // Send rejection notification to user
      await sendRejectionMail(request, type);
    }
    
    res.send(`
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 40px; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
          <div style="font-size: 50px; margin-bottom: 15px;">
            ${status === "approved" ? "✅" : "❌"}
          </div>
          <h2 style="color: ${status === "approved" ? "#28a745" : "#dc3545"}; margin-bottom: 15px; font-size: 24px; font-weight: 600;">
            Request ${status === "approved" ? "Approved" : "Rejected"}
          </h2>
          <p style="font-size: 16px; color: #555;">
            <strong>${type.toUpperCase()=="ED"?"Plant Head":type.toUpperCase()}</strong> has 
            ${status === "approved" ? "approved" : "rejected"} the request.
          </p>
          <div style="margin-top: 30px;">
            <p style="font-size: 14px; color: #777;">Request ID:</p>
            <p style="font-weight: 500; color: #333; font-size: 18px;">${id}</p>
          </div>
          <p style="margin-top: 40px; font-size: 13px; color: #999;">
            This action has been recorded successfully.<br/>
            Thank you for your response.
          </p>
        </div>
      </div>
    `);
  } catch (err) {
    console.error("Error in handleApproval:", err);
    res.status(500).send("Something went wrong");
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, role, comment } = req.body;

  try {
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    console.log("Full request object:", request);
    const requestObj = request.toObject();
    console.log(`updateRequestStatus called with id=${id}, role=${role}, status=${status}, item=${requestObj.item}`);

    // Validate the approval sequence
    if (role === "hr" && request.status.hod !== "approved") {
      return res.status(400).json({ error: "HOD must approve before HR" });
    }
    if (role === "hr" && request.item === "Printer" && request.status.ed !== "approved") {
      return res.status(400).json({ error: "Plant Head must approve before HR for Printer requests" });
    }
    if (role === "ithod" && request.status.hr !== "approved") {
      return res.status(400).json({ error: "HR must approve before ITHOD" });
    }

    // Update the request status, comment, and mark as actioned via dashboard
    request.status[role] = status;
    request.comments[role] = comment;
    request.actionedViaEmail = request.actionedViaEmail || {};
    request.actionedViaEmail[role] = false; // Mark as actioned via dashboard

    await request.save();

    if (status === "approved") {
      // Notify the user about approval at this level
      await sendApprovalMail(request, role);
      
      // Determine next step or final approval
      switch(role) {
        case "hod":
          if (request.item === "Printer") {
            await sendEDMail(request, id);
          } else {
            await sendHRMail(request, id);
          }
          break;
        case "ed":
          await sendHRMail(request, id);
          break;
        case "hr":
          await sendITHODMail(request, id);
          break;
        case "ithod":
          // Check if all approvals are complete
          const allApproved = 
            request.status.hod === "approved" && 
            (request.item === "Printer" ? request.status.ed === "approved" : true) &&
            request.status.hr === "approved" && 
            request.status.ithod === "approved";
            
          if (allApproved) {
            await sendFinalApprovalMail(request);
            await sendFinalMailToIT(request, id);
          }
          break;
      }
    } 
    else if (status === "rejected") {
      // Send rejection notification to user
      await sendRejectionMail(request, role);
    }
    
    res.status(200).json({ message: "Request status updated successfully" });
  } catch (err) {
    console.error("Error in updateRequestStatus:", err);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

module.exports = { 
  submitRequest, 
  handleApproval, 
  getAllRequests,
  updateRequestStatus
};