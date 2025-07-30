const BASE_URL = "https://it-request-system-1cjr.onrender.com";

document.addEventListener('DOMContentLoaded', async function() {
  // Check authentication status before loading the app
  const token = localStorage.getItem('token');
  
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const authCheck = await verifyToken(token);
    if (!authCheck.valid) {
      redirectToLogin();
      return;
    }
    
    // Token is valid, initialize the application
    initApp(authCheck.user);
  } catch (err) {
    console.error('Authentication check failed:', err);
    redirectToLogin();
  }
});

async function verifyToken(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/verify-auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      valid: response.ok,
      user: response.ok ? await response.json() : null
    };
  } catch (err) {
    console.error('Token verification error:', err);
    return { valid: false };
  }
}

function redirectToLogin() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

function initApp(userResponse) {
  // Extract actual user object from response
  const user = userResponse.user || userResponse;

  console.log('User authenticated:', user);
  
  // Update UI with user info
  const userProfile = document.querySelector('.user-profile span');
  if (userProfile) {
    userProfile.textContent = user.name || user.username;
  }

  // Populate sidebar with user info
  const userName = document.getElementById('regName');
  const userEmail = document.getElementById('regEmail');
  const userUsername = document.getElementById('regUsername');
  const userDepartment = document.getElementById('userDepartment');
  const userEmployeeCode = document.getElementById('userEmployeeCode');
  const userContactNumber = document.getElementById('userContactNumber');

  if (userName) userName.textContent = user.name || 'N/A';
  if (userEmail) userEmail.textContent = user.email || 'N/A';
  if (userUsername) userUsername.textContent = user.username || 'N/A';
  if (userDepartment) userDepartment.textContent = user.department || 'N/A';
  if (userEmployeeCode) userEmployeeCode.textContent = user.employeeCode || 'N/A';
  if (userContactNumber) userContactNumber.textContent = user.contactNumber || 'N/A';

  if (userName) userName.textContent = user.name || 'N/A';
  if (userEmail) userEmail.textContent = user.email || 'N/A';
  if (userUsername) userUsername.textContent = user.username || 'N/A';

  // Sidebar toggle functionality
  const profileIcon = document.getElementById('profileIcon');
  const userSidebar = document.getElementById('userSidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    userSidebar.style.right = '0';
    sidebarOverlay.style.opacity = '1';
    sidebarOverlay.style.visibility = 'visible';
  }

  function closeSidebarFunc() {
    userSidebar.style.right = '-300px';
    sidebarOverlay.style.opacity = '0';
    sidebarOverlay.style.visibility = 'hidden';
  }

  if (profileIcon) {
    profileIcon.addEventListener('click', openSidebar);
  }

  if (closeSidebar) {
    closeSidebar.addEventListener('click', closeSidebarFunc);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebarFunc);
  }

  // Add logout functionality
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      localStorage.removeItem('token');
      redirectToLogin();
    });
  }

}


