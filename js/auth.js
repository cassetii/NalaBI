// ================================================
// AUTHENTICATION MANAGEMENT
// Nala Project Management System
// ================================================

let currentUser = null;

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        onUserLoggedIn(user);
    } else {
        currentUser = null;
        onUserLoggedOut();
    }
});

// Handle user logged in
function onUserLoggedIn(user) {
    console.log('✅ User logged in:', user.email);
    
    // Hide login modal
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
    
    // Update UI
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = user.email;
    }
    
    // Initialize page-specific functions
    if (typeof initDashboard === 'function') {
        initDashboard();
    }
    
    if (typeof initAddProject === 'function') {
        initAddProject();
    }
    
    if (typeof initProjectDetail === 'function') {
        initProjectDetail();
    }
}

// Handle user logged out
function onUserLoggedOut() {
    console.log('❌ User logged out');
    
    // Show login modal
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
    }
    
    // Clear UI
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = 'Not logged in';
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                
                // Sign in
                await auth.signInWithEmailAndPassword(email, password);
                
                utils.showToast('Login berhasil!', 'success');
                
            } catch (error) {
                console.error('Login error:', error);
                
                let errorMessage = 'Login gagal. Silakan coba lagi.';
                
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Format email tidak valid.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'Akun ini telah dinonaktifkan.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'Email tidak terdaftar.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Password salah.';
                        break;
                    case 'auth/invalid-credential':
                        errorMessage = 'Email atau password salah.';
                        break;
                }
                
                errorDiv.textContent = errorMessage;
                errorDiv.style.display = 'block';
                
                // Reset button
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            }
        });
    }
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (confirm('Yakin ingin logout?')) {
                try {
                    await auth.signOut();
                    utils.showToast('Logout berhasil', 'success');
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    utils.showToast('Logout gagal', 'error');
                }
            }
        });
    }
});

// Export current user getter
window.getCurrentUser = () => currentUser;
