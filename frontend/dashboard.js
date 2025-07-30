const BASE_URL = "https://it-request-system-1cjr.onrender.com";

// Cache for modal instance
let commentModalInstance = null;

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) {
    window.location.href = "ithod_login.html";
    return false;
  }
  return true;
}

// Load and display requests
async function loadRequests() {
  if (!checkAuth()) return;

  try {
    // Fetch requests from backend
    const response = await fetch(`${BASE_URL}/api/requests`);
    if (!response.ok) {
      throw new Error("Failed to fetch requests");
    }

    const requests = await response.json();
    console.log("Loaded requests from backend:", requests);

    // Update localStorage with latest data
    localStorage.setItem("requests", JSON.stringify(requests));

    // Update UI
    updateStats(requests);
    
    // Check if modal is currently open
    const isModalOpen = document.querySelector('.modal.show') !== null;
    const currentModalId = isModalOpen ? document.querySelector('.modal.show').id : null;
    
    // Update the table
    displayRequests(requests);
    
    // If modal was open, restore it
    if (isModalOpen && currentModalId) {
      try {
        const modalElement = document.getElementById(currentModalId);
        if (modalElement) {
          // Clean up any other modals first
          cleanupExistingModals();
          // Re-add and show the modal
          document.body.appendChild(modalElement);
          const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
          });
          modal.show();
        }
      } catch (modalError) {
        console.error('Error restoring modal:', modalError);
        cleanupExistingModals();
      }
    }
  } catch (error) {
    console.error("Error loading requests:", error);
    // Show error message to user
    const tbody = document.getElementById("requestsTableBody");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        Failed to load requests. Please try again later.
                    </td>
                </tr>
            `;
    }
  }
}

// Update statistics
function updateStats(requests) {
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status.ithod === "pending").length,
    approved: requests.filter((r) => r.status.ithod === "approved").length,
    rejected: requests.filter((r) => r.status.ithod === "rejected").length,
  };

  document.getElementById("totalRequests").textContent = stats.total;
  document.getElementById("pendingRequests").textContent = stats.pending;
  document.getElementById("approvedRequests").textContent = stats.approved;
  document.getElementById("rejectedRequests").textContent = stats.rejected;
}

// Format status text
function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Display requests in table
function displayRequests(requests, filter = "all") {
  console.log("Displaying requests:", requests, "with filter:", filter);
  const tbody = document.getElementById("requestsTableBody");
  if (!tbody) {
    console.error("Table body element not found");
    return;
  }
  tbody.innerHTML = "";

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status && r.status.ithod === filter);

  filteredRequests.forEach((request) => {
    if (!request.status) {
      console.error("Request missing status:", request);
      return;
    }

    // Determine if ITHOD buttons should be enabled
    const isHODApproved = request.status.hod === "approved";
    const isHRApproved = request.status.hr === "approved";
    const isITHODPending = request.status.ithod === "pending";
    const showITHODActions = isITHODPending && isHODApproved && isHRApproved;
    const disableITHODActions = isITHODPending && (!isHODApproved || !isHRApproved);

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>
              <a href="#" class="request-id-link" data-id="${request._id}">
                #${request._id ? request._id.slice(-4) : ""}
              </a>
            </td>
            <td>${request.name || ""}</td>
            <td>${request.department || ""}</td>
            <td>${request.location || ""}</td>
            <td>${request.item || ""}</td>
            <td>${request.specialAllowance || ""}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status.hod)}">
                    HOD: ${formatStatus(request.status.hod)}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status.hr)}">
                    HR: ${formatStatus(request.status.hr)}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status.ithod)}">
                    IT: ${formatStatus(request.status.ithod)}
                </span>
            </td>
            <td>
                ${
                  request.status.ithod === "pending" && !request.actionedViaEmail?.ithod
                    ? `
                    <button class="btn btn-sm btn-outline-success action-btn approve" 
                            data-id="${request._id}" 
                            data-role="ithod"
                            ${disableITHODActions ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                        ${disableITHODActions ? ' (Pending Approvals)' : ''}
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn reject" 
                            data-id="${request._id}" 
                            data-role="ithod"
                            ${disableITHODActions ? 'disabled' : ''}>
                        <i class="fas fa-times"></i>
                        ${disableITHODActions ? ' (Pending Approvals)' : ''}
                    </button>
                    ${
                      disableITHODActions 
                        ? '<div class="small text-muted mt-1">Requires HOD & HR approval first</div>' 
                        : ''
                    }
                `
                    : request.actionedViaEmail?.ithod
                    ? `<span class="text-muted">Action taken via email</span>`
                    : ""
                }
            </td>
        `;

    tbody.appendChild(tr);
  });

  // Add click handlers for request ID links
  document.querySelectorAll('.request-id-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showRequestDetails(this.dataset.id);
    });
  });
}

// Helper function to clean up existing modals
function cleanupExistingModals() {
  try {
    // Remove all existing modals
    const existingModals = document.querySelectorAll('.modal');
    existingModals.forEach(modal => {
      try {
        // Hide the modal first if it's shown
        if (modal.classList.contains('show')) {
          modal.classList.remove('show');
          modal.style.display = 'none';
        }
        // Remove the modal from DOM
        modal.remove();
      } catch (modalError) {
        console.error('Error cleaning up modal:', modalError);
      }
    });

    // Remove all existing modal backdrops
    const existingBackdrops = document.querySelectorAll('.modal-backdrop');
    existingBackdrops.forEach(backdrop => {
      try {
        backdrop.remove();
      } catch (backdropError) {
        console.error('Error removing backdrop:', backdropError);
      }
    });

    // Reset body styles
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
    document.body.classList.remove('modal-open');
  } catch (error) {
    console.error('Error in cleanupExistingModals:', error);
  }
}

// Show request details in a modal
function showRequestDetails(requestId) {
  try {
    // Prevent multiple modals from being created
    if (document.querySelector('.modal.show')) {
      return;
    }

    // Clean up any existing modals first
    cleanupExistingModals();

    const requests = JSON.parse(localStorage.getItem("requests") || "[]");
    
    // Find the request with matching ID
    const request = requests.find(r => {
      // Handle both string and object ID comparison
      const storedId = typeof r._id === 'object' ? r._id.$oid : r._id;
      return storedId === requestId;
    });

    if (!request) {
      console.error('Request not found for ID:', requestId);
      alert('Request details not found');
      return;
    }

    // Create modal HTML with proper data display
    const modalHTML = `
      <div class="modal fade" id="requestDetailsModal" tabindex="-1" aria-labelledby="requestDetailsModalLabel" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="requestDetailsModalLabel">Request Details - #${request._id ? request._id.slice(-4) : 'N/A'}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="card mb-3">
                    <div class="card-header bg-grey text-black">
                      <h6>Personal Information</h6>
                    </div>
                    <div class="card-body">
                      <p><strong>Name:</strong> ${request.name || 'N/A'}</p>
                      <p><strong>Employee Code:</strong> ${request.employeeCode || 'N/A'}</p>
                      <p><strong>Department:</strong> ${request.department || 'N/A'}</p>
                      <p><strong>Location:</strong> ${request.location || 'N/A'}</p>
                      <p><strong>Email:</strong> ${request.email || 'N/A'}</p>
                      <p><strong>Contact:</strong> ${request.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card mb-3">
                    <div class="card-header bg-grey text-black">
                      <h6>Request Details</h6>
                    </div>
                    <div class="card-body">
                      <p><strong>Item Requested:</strong> ${request.item || 'N/A'}</p>
                      <p><strong>Address:</strong> ${request.address || 'N/A'}</p>
                      <p><strong>Special Allowance:</strong> ${request.specialAllowance || 'N/A'}</p>
                      <p><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
                      <p><strong>Date Requested:</strong> ${new Date(request.createdAt).toLocaleString() || 'N/A'}</p>
                      <p><strong>Alternate Contact:</strong> ${request.alternateContactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card">
                <div class="card-header bg-grey text-black">
                  <h6>Approval Status</h6>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <div class="text-center">
                      <p class="mb-1"><strong>HOD</strong></p>
                      <span class="badge ${getStatusBadgeClass(request.status.hod)}">
                        ${formatStatus(request.status.hod)}
                      </span>
                    </div>
                    <div class="text-center">
                      <p class="mb-1"><strong>HR</strong></p>
                      <span class="badge ${getStatusBadgeClass(request.status.hr)}">
                        ${formatStatus(request.status.hr)}
                      </span>
                    </div>
                    <div class="text-center">
                      <p class="mb-1"><strong>IT</strong></p>
                      <span class="badge ${getStatusBadgeClass(request.status.ithod)}">
                        ${formatStatus(request.status.ithod)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mt-3">
                <div class="card-header bg-grey text-black">
                  <h6>Comments</h6>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <p class="mb-1"><strong>HOD Comment:</strong></p>
                    <p class="text-muted">${request.comments?.hod || 'No comment'}</p>
                  </div>
                  <div class="mb-3">
                    <p class="mb-1"><strong>HR Comment:</strong></p>
                    <p class="text-muted">${request.comments?.hr || 'No comment'}</p>
                  </div>
                  <div class="mb-3">
                    <p class="mb-1"><strong>IT Comment:</strong></p>
                    <p class="text-muted">${request.comments?.ithod || 'No comment'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to the body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialize and show the modal
    const modalElement = document.getElementById('requestDetailsModal');
    if (!modalElement) {
      console.error('Modal element not found after creation');
      return;
    }

    const modal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    });
    
    // Add event listener for modal hidden event
    modalElement.addEventListener('hidden.bs.modal', function() {
      cleanupExistingModals();
    }, { once: true });

    modal.show();
  } catch (error) {
    console.error('Error in showRequestDetails:', error);
    cleanupExistingModals();
  }
}

// Get appropriate Bootstrap badge class for status
function getStatusBadgeClass(status) {
  if (!status) return "bg-secondary";

  switch (status.toLowerCase()) {
    case "pending":
      return "bg-warning text-dark";
    case "approved":
      return "bg-success";
    case "rejected":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
}

// Handle request actions (approve, reject, delete)
async function handleAction(e) {
  if (!e.target.classList.contains("action-btn")) return;

  const button = e.target.closest(".action-btn");
  const originalContent = button.innerHTML;
  
  // Show loading state
  button.disabled = true;
  button.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Processing...
  `;

  const requestId = button.dataset.id;
  const role = button.dataset.role;
  const action = button.classList.contains("approve") ? "approved" : "rejected";

  try {
    // Show comment input modal
    const comment = await new Promise((resolve) => {
      // Create modal if it doesn't exist
      if (!commentModalInstance) {
        const modalHTML = `
          <div class="modal fade" id="commentModal" tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Add Comment</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                  <div class="mb-3">
                    <label for="commentInput" class="form-label">Comment:</label>
                    <textarea class="form-control" id="commentInput" rows="3" required></textarea>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="button" class="btn btn-primary" id="submitComment">Submit</button>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        commentModalInstance = new bootstrap.Modal(document.getElementById('commentModal'));
      }

      const modalElement = document.getElementById('commentModal');
      const submitBtn = document.getElementById('submitComment');
      const commentInput = document.getElementById('commentInput');

      // Clear previous comment
      commentInput.value = '';

      // Remove existing event listeners
      const newSubmitBtn = submitBtn.cloneNode(true);
      submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

      // Add new event listeners
      newSubmitBtn.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
          commentModalInstance.hide();
          resolve(comment);
        }
      });

      modalElement.addEventListener('hidden.bs.modal', () => {
        resolve(null);
      }, { once: true });

      commentModalInstance.show();
    });

    if (!comment) {
      // Restore button state if user cancels
      button.disabled = false;
      button.innerHTML = originalContent;
      return;
    }

    const response = await fetch(`${BASE_URL}/api/requests/${requestId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: action,
        role: role,
        comment: comment
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update request status");
    }

    // Update button to show success state
    button.innerHTML = `
      <i class="fas fa-check"></i>
      ${action === "approved" ? "Approved" : "Rejected"}
    `;
    button.classList.remove("btn-outline-success", "btn-outline-danger");
    button.classList.add(action === "approved" ? "btn-success" : "btn-danger");
    button.disabled = true;

    // Reload requests to show updated status
    loadRequests();
  } catch (error) {
    console.error("Error updating request status:", error);
    alert("Failed to update request status. Please try again.");
    
    // Restore button state on error
    button.disabled = false;
    button.innerHTML = originalContent;
  }
}

// Handle search functionality
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  const filtered = requests.filter((r) => {
    // Search through all relevant fields
    return (
      (r.name && r.name.toLowerCase().includes(searchTerm)) ||
      (r.department && r.department.toLowerCase().includes(searchTerm)) ||
      (r.location && r.location.toLowerCase().includes(searchTerm)) ||
      (r.item && r.item.toLowerCase().includes(searchTerm)) ||
      (r.specialAllowance && r.specialAllowance.toLowerCase().includes(searchTerm)) ||
      (r.employeeCode && r.employeeCode.toLowerCase().includes(searchTerm)) ||
      (r.email && r.email.toLowerCase().includes(searchTerm)) ||
      (r.contactNumber && r.contactNumber.toLowerCase().includes(searchTerm)) ||
      (r.address && r.address.toLowerCase().includes(searchTerm)) ||
      (r.reason && r.reason.toLowerCase().includes(searchTerm)) ||
      (r.alternateContactNumber && r.alternateContactNumber.toLowerCase().includes(searchTerm))
    );
  });
  displayRequests(filtered);
}

// Handle filter buttons
function handleFilter(e) {
  const btn = e.target.closest(".btn");
  if (!btn || !btn.dataset.filter) return;

  document.querySelectorAll("[data-filter]").forEach((el) => {
    el.classList.remove("active");
  });
  btn.classList.add("active");

  const filter = btn.dataset.filter;
  const role = btn.dataset.role || "ithod";
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status[role] === filter);

  displayRequests(filteredRequests);
}

// Logout functionality
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "ithod_login.html";
}

// Initialize dashboard
function initDashboard() {
  if (!checkAuth()) return;
  console.log("Initializing dashboard...");
  loadRequests();

  // Remove any existing event listeners first
  const searchInput = document.getElementById("searchInput");
  const btnGroup = document.querySelector(".btn-group");
  const tableBody = document.getElementById("requestsTableBody");

  if (searchInput) {
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    newSearchInput.addEventListener("input", handleSearch);
  }

  if (btnGroup) {
    const newBtnGroup = btnGroup.cloneNode(true);
    btnGroup.parentNode.replaceChild(newBtnGroup, btnGroup);
    newBtnGroup.addEventListener("click", handleFilter);
  }

  if (tableBody) {
    const newTableBody = tableBody.cloneNode(true);
    tableBody.parentNode.replaceChild(newTableBody, tableBody);
    newTableBody.addEventListener("click", function (e) {
      const btn = e.target.closest(".action-btn");
      if (btn) {
        e.preventDefault();
        handleAction(e);
      }
      
      const idLink = e.target.closest(".request-id-link");
      if (idLink) {
        e.preventDefault();
        showRequestDetails(idLink.dataset.id);
      }
    });
  }

  // Auto-refresh every 30 seconds
  const refreshInterval = setInterval(loadRequests, 30000);

  // Cleanup function for when the page is unloaded
  window.addEventListener('beforeunload', function() {
    clearInterval(refreshInterval);
    cleanupExistingModals();
  });
}

// Run initialization when page loads
document.addEventListener("DOMContentLoaded", initDashboard);
