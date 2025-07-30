document.addEventListener('DOMContentLoaded', function() {
  // Check for JWT token to enforce login
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  // Logout button handler
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // Form navigation
  const formSections = document.querySelectorAll('.form-section');
  const progressSteps = document.querySelectorAll('.progress-step');
  const btnNext = document.querySelectorAll('.btn-next');
  const btnPrev = document.querySelectorAll('.btn-prev');
  const submitButton = document.getElementById('submitButton');
  const successModal = document.getElementById('successModal');
  const printReceipt = document.getElementById('printReceipt');
  const newRequest = document.getElementById('newRequest');
  const charCount = document.getElementById('charCount');
  const reasonTextarea = document.getElementById('reason');
  
  // HOD Email mapping
  const hodEmail = {
    "Unit Head Office": "shivanshrawat2003@gmail.com",
    "Operation & Maintenance": "shivanshrawat2003@gmail.com",
    "Operations, Chemistry": "shivanshrawat2003@gmail.com",
    "Coal Quality Management": "shivanshrawat2003@gmail.com",
    "Boiler Maintenance": "shivanshrawat2003@gmail.com",
    "Turbine & Auxiliaries": "shivanshrawat2003@gmail.com",
    "CHP, AHP, Bio Mass, Ash Management": "shivanshrawat2003@gmail.com",
    "Electrical": "shivanshrawat2003@gmail.com",
    "Control & Instrumentation": "shivanshrawat2003@gmail.com",
    "Technical Services": "shivanshrawat2003@gmail.com",
    "Coal Management Group": "shivanshrawat2003@gmail.com",
    "Ash management": "shivanshrawat2003@gmail.com",
    "LAQ": "shivanshrawat2003@gmail.com",
    "Finance & Accounts": "shivanshrawat2003@gmail.com",
    "HR ES CSR Medical, Town Maint": "shivanshrawat2003@gmail.com",
    "Admin": "shivanshrawat2003@gmail.com",
    "HR": "shivanshrawat2003@gmail.com",
    "Medical": "shivanshrawat2003@gmail.com",
    "Corporate HR": "shivanshrawat2003@gmail.com",
    "CSR": "shivanshrawat2003@gmail.com",
    "Information Technology": "shivanshrawat2003@gmail.com",
    "MM&C": "shivanshrawat2003@gmail.com",
    "EHS": "shivanshrawat2003@gmail.com",
    "Solar, Mechanical Project, Civil, Plant Horticulture": "shivanshrawat2003@gmail.com",
    "Electrical Project, TL": "shivanshrawat2003@gmail.com",
    "Mines and CPP": "shivanshrawat2003@gmail.com",
    "JIPT": "shivanshrawat2003@gmail.com",
    "IV/1": "shivanshrawat2003@gmail.com",
    "Sector 1 E": "shivanshrawat2003@gmail.com",
    "IV/2-3": "shivanshrawat2003@gmail.com",
    "Security": "shivanshrawat2003@gmail.com",
  };

  // Designations that qualify for Special Allowance
  const specialAllowanceDesignations = [
    "Others",
    "Apprentice",
    "Junior Engineer",
    "Assistant Engineer" 
  ];

  let currentSection = 0;

  // Show first section by default
  showSection(currentSection);

  // Auto-fill HOD email
  document.getElementById("department").addEventListener("change", function() {
    const selectedDept = this.value;
    const hodEmailInput = document.getElementById("hodEmail");
    hodEmailInput.value = hodEmail[selectedDept] || "";
  });

  // Set and lock Special Allowance based on designation
  document.querySelector('select[name="designation"]').addEventListener('change', function() {
    const designation = this.value;
    const radioYes = document.querySelector('input[name="specialAllowance"][value="YES"]');
    const radioNo = document.querySelector('input[name="specialAllowance"][value="NO"]');
    const radioGroup = document.querySelector('.radio-group');
    
    // Check if designation qualifies for special allowance
    const qualifiesForAllowance = specialAllowanceDesignations.includes(designation);
    
    // Set the value and disable the radio buttons
    radioYes.checked = qualifiesForAllowance;
    radioNo.checked = !qualifiesForAllowance;
    radioYes.disabled = true;
    radioNo.disabled = true;
    
    // Add visual indication that field is auto-set
    if (qualifiesForAllowance) {
      radioGroup.classList.add('allowance-yes');
      radioGroup.classList.remove('allowance-no');
    } else {
      radioGroup.classList.add('allowance-no');
      radioGroup.classList.remove('allowance-yes');
    }
  });

  // Initialize designation on page load
  const designationSelect = document.querySelector('select[name="designation"]');
  if (designationSelect.value) {
    designationSelect.dispatchEvent(new Event('change'));
  }

  // Next button click handler
  btnNext.forEach(btn => {
    btn.addEventListener('click', function() {
      if (validateSection(currentSection)) {
        currentSection++;
        showSection(currentSection);
        updateProgress();
      }
    });
  });

  // Previous button click handler
  btnPrev.forEach(btn => {
    btn.addEventListener('click', function() {
      currentSection--;
      showSection(currentSection);
      updateProgress();
    });
  });

  // Character counter for reason textarea
  if (reasonTextarea) {
    reasonTextarea.addEventListener('input', function() {
      charCount.textContent = this.value.length;
    });
  }

  // Form submission handler
  if (submitButton) {
    submitButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (validateSection(currentSection)) {
        submitForm();
      }
    });
  }

  // Print receipt button
  if (printReceipt) {
    printReceipt.addEventListener('click', function() {
      window.print();
    });
  }

  // New request button
  if (newRequest) {
    newRequest.addEventListener('click', function() {
      successModal.classList.remove('active');
      currentSection = 0;
      showSection(currentSection);
      updateProgress();
      document.getElementById('requestForm').reset();
      charCount.textContent = '0';
      document.getElementById('hodEmail').value = '';
      
      // Reset radio buttons
      const radioYes = document.querySelector('input[name="specialAllowance"][value="YES"]');
      const radioNo = document.querySelector('input[name="specialAllowance"][value="NO"]');
      const radioGroup = document.querySelector('.radio-group');
      radioYes.checked = false;
      radioNo.checked = true;
      radioYes.disabled = false;
      radioNo.disabled = false;
      radioGroup.classList.remove('allowance-yes', 'allowance-no');
    });
  };

  // Show specific section
  function showSection(index) {
    formSections.forEach((section, i) => {
      section.classList.toggle('active', i === index);
    });
    
    // Update review section if we're on the review step
    if (index === 2) {
      updateReviewSection();
    }
  }

  // Update progress indicator
  function updateProgress() {
    progressSteps.forEach((step, i) => {
      step.classList.toggle('active', i <= currentSection);
    });
  }

  // Validate current section
  function validateSection(index) {
    const currentSection = formSections[index];
    const inputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('error');
        isValid = false;
      } else {
        input.classList.remove('error');
      }
    });
    
    // Validate contact number format if provided
    const contactNumber = document.getElementById('contactNumber');
    if (contactNumber && contactNumber.value) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(contactNumber.value)) {
        contactNumber.classList.add('error');
        alert('Please enter a valid contact number (10-15 digits)');
        isValid = false;
      }
    }
    
    if (!isValid) {
      alert('Please fill in all required fields correctly');
    }
    
    return isValid;
  }

  // Update review section with entered data
  function updateReviewSection() {
    const personalInfoReview = document.getElementById('personalInfoReview');
    const equipmentReview = document.getElementById('equipmentReview');
    
    // Personal Info
    let personalInfoHTML = `
      <div class="review-details">
        <div class="review-field">
          <label>Name</label>
          <p>${document.getElementById('name').value}</p>
        </div>
        <div class="review-field">
          <label>Employee Code</label>
          <p>${document.getElementById('employeeCode').value}</p>
        </div>
        <div class="review-field">
          <label>Designation</label>
          <p>${document.getElementById('designation').value}</p>
        </div>
        <div class="review-field">
          <label>Special Exception</label>
          <p>${document.querySelector('input[name="specialAllowance"]:checked').value}</p>
        </div>
        <div class="review-field">
          <label>User Email</label>
          <p>${document.getElementById('email').value}</p>
        </div>
        <div class="review-field">
          <label>Department</label>
          <p>${document.getElementById('department').value}</p>
        </div>
        <div class="review-field">
          <label>HOD Email</label>
          <p>${document.getElementById('hodEmail').value}</p>
        </div>
        <div class="review-field">
          <label>Location</label>
          <p>${document.getElementById('location').value}</p>
        </div>
        <div class="review-field">
          <label>Address</label>
          <p>${document.getElementById('address').value}</p>
        </div>
        <div class="review-field">
          <label>Contact Number</label>
          <p>${document.getElementById('contactNumber').value}</p>
        </div>
        <div class="review-field">
          <label>Alternate Contact</label>
          <p>${document.getElementById('alternateContactNumber').value || 'N/A'}</p>
        </div>
      </div>
    `;
    
    // Equipment Details
    let equipmentHTML = `
      <div class="review-details">
        <div class="review-field">
          <label>Selected Item</label>
          <p>${document.getElementById('item').value}</p>
        </div>
        <div class="review-field full-width">
          <label>Reason</label>
          <p>${document.getElementById('reason').value || 'N/A'}</p>
        </div>
      </div>
    `;
    
    personalInfoReview.innerHTML = personalInfoHTML;
    equipmentReview.innerHTML = equipmentHTML;
  }

  // Submit form data
  async function submitForm() {
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;

    const token = localStorage.getItem('token');
    console.log('Token before submission:', token);

    if (!token) {
      alert('You are not logged in. Please login to submit the form.');
      window.location.href = 'login.html';
      return;
    }

    // Decode JWT token to check expiry
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      alert('Invalid session token. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      return;
    }
    
    const form = document.getElementById('requestForm');
    const formData = {
      name: form.name.value,
      employeeCode: form.employeeCode.value,
      designation: form.designation.value,
      email: form.email.value,
      department: form.department.value,
      location: form.location.value,
      specialAllowance: document.querySelector('input[name="specialAllowance"]:checked').value,
      requestedBy: document.querySelector('input[name="requestedBy"]:checked').value,
      item: form.item.value,
      reason: form.reason.value,
      hodEmail: form.hodEmail.value,
      address: form.address.value,
      contactNumber: form.contactNumber.value,
      alternateContactNumber: form.alternateContactNumber.value || null
    };

    console.log('Submitting form data:', formData);

    try {
      const BASE_URL = "http://localhost:5000";
      const response = await fetch(`${BASE_URL}/api/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          alert('Session expired or user not found. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'login.html';
          return;
        }

        const errorData = await response.text();
        let errorMessage = 'Submission failed';
        
        try {
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.error || jsonError.message || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);

      successModal.classList.add('active');
      const strongElem = document.querySelector('#successModal strong');
      if (strongElem) {
        strongElem.textContent = result.requestId || 'IT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      }
      
    } catch (err) {
      console.error('Submission error:', err);
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${err.message || 'Failed to submit request. Please try again.'}</span>
      `;
      
      const formActions = document.querySelector('.form-navigation');
      if (formActions) {
        if (submitButton.nextSibling && submitButton.nextSibling.parentNode === formActions) {
          formActions.insertBefore(errorDiv, submitButton.nextSibling);
        } else {
          formActions.appendChild(errorDiv);
        }
      } else {
        document.querySelector('.form-container').appendChild(errorDiv);
      }
      
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
      
    } finally {
      submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
      submitButton.disabled = false;
    }
  }
});
