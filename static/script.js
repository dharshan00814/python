/**
 * Hostel & Mess Management System - Frontend JavaScript
 */

var FLASK_ORIGIN = 'http://127.0.0.1:5000';
var IS_FLASK_ORIGIN = window.location.port === '5000';

// API Base URL
var API_ORIGIN = IS_FLASK_ORIGIN ? '' : FLASK_ORIGIN;
var API_BASE = API_ORIGIN + '/api';
var FETCH_CREDENTIALS = IS_FLASK_ORIGIN ? 'same-origin' : 'include';

// State management
let currentSection = 'dashboard';
let currentUser = null;
let currentData = {
    students: [],
    rooms: [],
    bills: [],
    feedback: [],
    menu: [],
    attendanceLogs: []
};
let cameraScanner = null;
let cameraScanning = false;

// Initialize application
if (IS_FLASK_ORIGIN) {
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });
}

async function initializeApp() {
    const authenticated = await loadCurrentUser();
    if (!authenticated) {
        return;
    }

    applyRolePermissions();

    // Set up navigation
    setupNavigation();
    
    // Set up modal
    setupModal();
    
    // Set up date inputs
    setupDateInputs();
    
    // Load initial data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
}

async function loadCurrentUser() {
    try {
        const response = await fetch(API_BASE + '/auth/me', {
            credentials: FETCH_CREDENTIALS,
        });
        if (!response.ok) {
            window.location.href = '/';
            return false;
        }

        currentUser = await response.json();
        const name = currentUser.name || 'User';
        const roleLabel = currentUser.role === 'admin' ? 'Administrator' : 'Student';

        const nameEl = document.getElementById('sidebarUserName');
        const roleEl = document.getElementById('sidebarUserRole');
        const avatarEl = document.getElementById('sidebarUserAvatar');
        if (nameEl) nameEl.textContent = name;
        if (roleEl) roleEl.textContent = roleLabel;
        if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();

        return true;
    } catch (error) {
        window.location.href = '/';
        return false;
    }
}

function applyRolePermissions() {
    if (!currentUser || currentUser.role === 'admin') {
        return;
    }

    const addNewBtn = document.getElementById('addNewBtn');
    if (addNewBtn) {
        addNewBtn.style.display = 'none';
    }

    const adminOnlySections = ['students', 'attendance', 'feedback'];
    adminOnlySections.forEach(section => {
        const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
        if (navItem) {
            navItem.style.display = 'none';
        }
    });

    const generateBillBtn = document.getElementById('generateBillBtn');
    if (generateBillBtn) {
        generateBillBtn.style.display = 'none';
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        if (currentSection === 'attendance' && sectionId !== 'attendance') {
            stopCameraScan();
        }

        section.classList.add('active');
        currentSection = sectionId;
        
        // Update header title
        updateHeaderTitle(sectionId);
        
        // Load section-specific data
        loadSectionData(sectionId);
    }
}

function updateHeaderTitle(sectionId) {
    const titles = {
        dashboard: 'Dashboard',
        students: 'Student Management',
        rooms: 'Room Management',
        mess: 'Mess Management',
        attendance: 'Attendance Management',
        billing: 'Billing & Payments',
        feedback: 'Feedback & Complaints'
    };
    
    const headerTitle = document.querySelector('.header-title h1');
    if (headerTitle && titles[sectionId]) {
        headerTitle.textContent = titles[sectionId];
    }
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'students':
            loadStudentsData();
            break;
        case 'rooms':
            loadRoomsData();
            break;
        case 'mess':
            loadMessData();
            break;
        case 'attendance':
            loadAttendanceData();
            break;
        case 'billing':
            loadBillsData();
            break;
        case 'feedback':
            loadFeedbackData();
            break;
    }
}

function setupModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('modalClose');
    const addNewBtn = document.getElementById('addNewBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => openAddModal());
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
}

function openModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = content;
    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('active');
}

function openAddModal() {
    if (currentUser && currentUser.role !== 'admin') {
        showNotification('Error', 'Students are not allowed to add or edit records');
        return;
    }

    let title = 'Add New';
    let content = '';
    
    switch(currentSection) {
        case 'students':
            title = 'Add Student';
            content = getStudentForm();
            break;
        case 'rooms':
            title = 'Add Room';
            content = getRoomForm();
            break;
        case 'mess':
            title = 'Add Menu Item';
            content = getMenuForm();
            break;
        case 'billing':
            title = 'Generate Bill';
            content = getBillForm();
            break;
        case 'feedback':
            title = 'Submit Feedback';
            content = getFeedbackForm();
            break;
        default:
            title = 'Add New';
            content = '<p>Select a section to add data</p>';
    }
    
    openModal(title, content);
    
    // Set up form submission
    setupFormSubmission();
}

function getStudentForm() {
    return `
        <form id="studentForm">
            <div class="form-group">
                <label>Student ID</label>
                <input type="text" name="student_id" required>
            </div>
            <div class="form-group">
                <label>ID Card UID</label>
                <input type="text" name="id_card_uid" placeholder="Example: 25RUCSA015" required>
            </div>
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Login Password</label>
                <input type="password" name="login_password" placeholder="Set student login password" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" name="phone">
            </div>
            <div class="form-group">
                <label>Department</label>
                <input type="text" name="department" required>
            </div>
            <div class="form-group">
                <label>Year</label>
                <select name="year">
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getRoomForm() {
    return `
        <form id="roomForm">
            <div class="form-group">
                <label>Room Number</label>
                <input type="text" name="room_number" required>
            </div>
            <div class="form-group">
                <label>Block</label>
                <select name="block" required>
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                    <option value="D">Block D</option>
                </select>
            </div>
            <div class="form-group">
                <label>Floor</label>
                <input type="number" name="floor" min="1" max="5" required>
            </div>
            <div class="form-group">
                <label>Capacity</label>
                <input type="number" name="capacity" min="1" max="8" value="4">
            </div>
            <div class="form-group">
                <label>Room Type</label>
                <select name="room_type">
                    <option value="standard">Standard</option>
                    <option value="ac">AC</option>
                    <option value="premium">Premium</option>
                </select>
            </div>
            <div class="form-group">
                <label>Monthly Rent (₹)</label>
                <input type="number" name="monthly_rent" value="5000">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getMenuForm() {
    return `
        <form id="menuForm">
            <div class="form-group">
                <label>Item Name</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select name="category" required>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                </select>
            </div>
            <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" name="price" step="0.01" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getBillForm() {
    return `
        <form id="billForm">
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" name="student_name" placeholder="Enter student name">
            </div>
            <div class="form-group">
                <label>Room Number (required for Room Rent)</label>
                <input type="text" name="room_number" placeholder="Example: A-101">
            </div>
            <div class="form-group">
                <label>Bill Type</label>
                <select name="bill_type" required>
                    <option value="room">Room Rent</option>
                    <option value="food">Food</option>
                    <option value="hostel">Hostel</option>
                    <option value="mess">Mess</option>
                    <option value="laundry">Laundry</option>
                </select>
            </div>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" name="amount" required>
            </div>
            <div class="form-group">
                <label>Due Date</label>
                <input type="date" name="due_date" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Generate</button>
            </div>
        </form>
    `;
}

function getFeedbackForm() {
    return `
        <form id="feedbackForm">
            <div class="form-group">
                <label>Category</label>
                <select name="category" required>
                    <option value="hostel">Hostel</option>
                    <option value="mess">Mess</option>
                    <option value="cleanliness">Cleanliness</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Subject</label>
                <input type="text" name="subject" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select name="priority">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit</button>
            </div>
        </form>
    `;
}

function getPaymentForm(bill) {
    const today = new Date().toISOString().split('T')[0];
    return `
        <form id="paymentForm">
            <div class="form-group">
                <label>Bill ID</label>
                <input type="text" value="#${bill.id}" readonly>
            </div>
            <div class="form-group">
                <label>Student</label>
                <input type="text" value="${bill.student_name || 'N/A'}" readonly>
            </div>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="text" value="${bill.amount}" readonly>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select name="payment_method" required>
                    <option value="online">Online</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                </select>
            </div>
            <div class="form-group">
                <label>Transaction Reference</label>
                <input type="text" name="transaction_ref" placeholder="Optional reference number">
            </div>
            <div class="form-group">
                <label>Paid Date</label>
                <input type="date" name="paid_date" value="${today}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Confirm Payment</button>
            </div>
        </form>
    `;
}

function setupFormSubmission() {
    const form = document.querySelector('#modalBody form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        let endpoint = '';
        let method = 'POST';
        
        switch(currentSection) {
            case 'students':
                endpoint = '/students';
                break;
            case 'rooms':
                endpoint = '/rooms';
                break;
            case 'mess':
                endpoint = '/menu';
                break;
            case 'billing':
                endpoint = '/bills/generate-monthly';
                method = 'POST';
                break;
            case 'feedback':
                endpoint = '/feedback';
                break;
        }
        
        if (endpoint) {
            try {
                const response = await fetch(API_BASE + endpoint, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    closeModal();
                    loadSectionData(currentSection);
                    showNotification('Success', 'Data saved successfully');
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    showNotification('Error', errorData.error || 'Failed to save data');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Error', 'An error occurred while saving data');
            }
        }
    });
}

function setupDateInputs() {
    const dateInputs = document.querySelectorAll('.date-input');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                await fetch(API_BASE + '/auth/logout', {
                    method: 'POST',
                    credentials: FETCH_CREDENTIALS,
                });
            } catch (error) {
                console.error('Logout failed:', error);
            }
            window.location.href = '/';
        });
    }

    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', openNotificationsModal);
    }

    // Search inputs
    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
        studentSearch.addEventListener('input', debounce(filterStudents, 300));
    }
    
    // Filter selects
    const billStatusFilter = document.getElementById('billStatusFilter');
    if (billStatusFilter) {
        billStatusFilter.addEventListener('change', filterBills);
    }
    
    const feedbackStatusFilter = document.getElementById('feedbackStatusFilter');
    if (feedbackStatusFilter) {
        feedbackStatusFilter.addEventListener('change', filterFeedback);
    }
    
    // Mess tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    const addMenuBtn = document.getElementById('addMenuBtn');
    if (addMenuBtn) {
        addMenuBtn.addEventListener('click', function() {
            currentSection = 'mess';
            openModal('Add Menu Item', getMenuForm());
            setupFormSubmission();
        });
    }

    const generateBillBtn = document.getElementById('generateBillBtn');
    if (generateBillBtn) {
        generateBillBtn.addEventListener('click', function() {
            currentSection = 'billing';
            openModal('Generate Bill', getBillForm());
            setupFormSubmission();
        });
    }

    const viewOverdueBtn = document.getElementById('viewOverdueBtn');
    if (viewOverdueBtn) {
        viewOverdueBtn.addEventListener('click', function() {
            const billStatusFilter = document.getElementById('billStatusFilter');
            if (billStatusFilter) {
                billStatusFilter.value = 'overdue';
            }
            filterBills();
        });
    }

    const attendanceDate = document.getElementById('attendanceDate');
    if (attendanceDate) {
        attendanceDate.addEventListener('change', loadAttendanceData);
    }

    const attendanceLogSearch = document.getElementById('attendanceLogSearch');
    if (attendanceLogSearch) {
        attendanceLogSearch.addEventListener('input', debounce(loadAttendanceLogs, 300));
    }

    const attendanceLogTypeFilter = document.getElementById('attendanceLogTypeFilter');
    if (attendanceLogTypeFilter) {
        attendanceLogTypeFilter.addEventListener('change', loadAttendanceLogs);
    }

    const refreshAttendanceLogBtn = document.getElementById('refreshAttendanceLogBtn');
    if (refreshAttendanceLogBtn) {
        refreshAttendanceLogBtn.addEventListener('click', loadAttendanceLogs);
    }

    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', loadAttendanceData);
    }

    const scanNowBtn = document.getElementById('scanNowBtn');
    if (scanNowBtn) {
        scanNowBtn.addEventListener('click', scanAttendanceById);
    }

    const startCameraScanBtn = document.getElementById('startCameraScanBtn');
    if (startCameraScanBtn) {
        startCameraScanBtn.addEventListener('click', startCameraScan);
    }

    const stopCameraScanBtn = document.getElementById('stopCameraScanBtn');
    if (stopCameraScanBtn) {
        stopCameraScanBtn.addEventListener('click', stopCameraScan);
    }

    const scanIdInput = document.getElementById('scanIdInput');
    if (scanIdInput) {
        scanIdInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                scanAttendanceById();
            }
        });
    }
}

function openNotificationsModal() {
    const recentActivity = document.getElementById('recentActivity');
    const badgeEl = document.querySelector('.notification-btn .badge');

    let notificationsHtml = '<p class="empty-state">No notifications right now.</p>';

    if (recentActivity) {
        const activityItems = Array.from(recentActivity.querySelectorAll('.activity-item')).slice(0, 8);
        if (activityItems.length > 0) {
            notificationsHtml = activityItems.map(item => {
                const message = item.querySelector('.activity-content p')?.textContent?.trim() || 'Update';
                const time = item.querySelector('.activity-time')?.textContent?.trim() || 'Just now';
                return `
                    <div class="activity-item">
                        <div class="activity-content">
                            <p>${message}</p>
                            <span class="activity-time">${time}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    if (badgeEl) {
        badgeEl.textContent = '0';
        badgeEl.style.display = 'none';
    }

    openModal('Notifications', `<div class="activity-list">${notificationsHtml}</div>`);
}

function switchTab(tabId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// API Functions
async function loadDashboardData() {
    try {
        const [statsRes, revenueRes] = await Promise.all([
            fetch(API_BASE + '/dashboard/stats'),
            fetch(API_BASE + '/dashboard/revenue')
        ]);
        
        const stats = await statsRes.json();
        const revenue = await revenueRes.json();
        
        // Update dashboard
        document.getElementById('totalStudents').textContent = stats.total_students || 0;
        document.getElementById('occupiedRooms').textContent = stats.occupied_rooms || 0;
        document.getElementById('presentToday').textContent = stats.present_today || 0;
        document.getElementById('monthlyRevenue').textContent = '₹' + (revenue.monthly_revenue || 0).toLocaleString();
        
        document.getElementById('availableRooms').textContent = stats.available_rooms || 0;
        document.getElementById('chartOccupiedRooms').textContent = stats.occupied_rooms || 0;
        
        const totalRooms = stats.total_rooms || 1;
        const occupancyPercent = (stats.occupied_rooms / totalRooms) * 100;
        document.getElementById('occupancyFill').style.width = occupancyPercent + '%';
        
        document.getElementById('pendingBills').textContent = stats.pending_bills || 0;
        document.getElementById('overdueBills').textContent = stats.overdue_bills || 0;
        document.getElementById('openFeedback').textContent = stats.open_feedback || 0;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadStudentsData() {
    try {
        const response = await fetch(API_BASE + '/students');
        const students = await response.json();
        currentData.students = students;
        renderStudentsTable(students);
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No students found</td></tr>';
        return;
    }
    
    const canEditStudent = currentUser && currentUser.role === 'admin';

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.student_id || `S${String(student.id).padStart(3, '0')}`}</td>
            <td>${student.id_card_uid || '-'}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.department || '-'}</td>
            <td>${student.year ? student.year + ' Year' : '-'}</td>
            <td><span class="status-badge ${student.status}">${student.status}</span></td>
            <td class="actions">
                <button class="btn-icon" onclick="viewStudent(${student.id})" title="View"><i class="fas fa-eye"></i></button>
                ${canEditStudent ? `<button class="btn-icon" onclick="editStudent(${student.id})" title="Edit"><i class="fas fa-edit"></i></button>` : ''}
            </td>
        </tr>
    `).join('');
}

function filterStudents() {
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const status = document.getElementById('studentStatusFilter').value;
    
    let filtered = currentData.students;
    
    if (search) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(search) || 
            (s.student_id || `S${String(s.id).padStart(3, '0')}`).toLowerCase().includes(search) ||
            s.email.toLowerCase().includes(search)
        );
    }
    
    if (status) {
        filtered = filtered.filter(s => s.status === status);
    }
    
    renderStudentsTable(filtered);
}

async function loadRoomsData() {
    try {
        const response = await fetch(API_BASE + '/rooms');
        const rooms = await response.json();
        currentData.rooms = rooms;
        renderRoomsGrid(rooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

function renderRoomsGrid(rooms) {
    const grid = document.getElementById('roomsGrid');
    if (!grid) return;
    
    if (rooms.length === 0) {
        grid.innerHTML = '<p style="text-align: center;">No rooms found</p>';
        return;
    }
    
    grid.innerHTML = rooms.map(room => `
        <div class="room-card ${room.status}">
            <div class="room-header">
                <div>
                    <div class="room-number">Room ${room.room_number}</div>
                    <div class="room-block">Block ${room.block}, Floor ${room.floor}</div>
                </div>
                <span class="room-status ${room.status}">${room.status}</span>
            </div>
            <div class="room-details">
                <div class="room-detail">
                    <i class="fas fa-user-friends"></i>
                    <span>${room.current_occupancy}/${room.capacity} Students</span>
                </div>
                <div class="room-detail">
                    <i class="fas fa-star"></i>
                    <span>${room.room_type || 'Standard'}</span>
                </div>
            </div>
            <div class="room-rent">
                ₹${room.monthly_rent}<span>/month</span>
            </div>
            <div class="quick-pay-actions">
                <button class="btn btn-primary btn-sm" onclick="instantPayRoom(${room.id})">
                    <i class="fas fa-bolt"></i> Pay Room Instantly
                </button>
                ${Number(room.current_occupancy || 0) > 0 ? `
                <button class="btn btn-secondary btn-sm" onclick="vacateRoom(${room.id})">
                    <i class="fas fa-door-open"></i> Vacate 1 Student
                </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function loadMessData() {
    try {
        const response = await fetch(API_BASE + '/menu');
        const menu = await response.json();
        currentData.menu = menu;
        renderMenuGrid(menu);
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

function renderMenuGrid(menu) {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    
    if (menu.length === 0) {
        grid.innerHTML = '<p style="text-align: center;">No menu items found</p>';
        return;
    }
    
    grid.innerHTML = menu.map(item => `
        <div class="menu-item">
            <div class="menu-item-header">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">₹${item.price}</div>
            </div>
            <div class="menu-item-desc">${item.description || ''}</div>
            <span class="menu-item-category">${item.category}</span>
            <div class="quick-pay-actions">
                <button class="btn btn-secondary btn-sm" onclick="instantPayFood(${item.id})">
                    <i class="fas fa-qrcode"></i> Pay with GPay / QR
                </button>
            </div>
        </div>
    `).join('');
}

async function loadAttendanceData() {
    const date = document.getElementById('attendanceDate')?.value || new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch(API_BASE + `/attendance/daily-report?date=${date}`);
        const report = await response.json();
        
        document.getElementById('attPresent').textContent = report.present || 0;
        document.getElementById('attAbsent').textContent = report.absent || 0;
        document.getElementById('attLeave').textContent = report.on_leave || 0;
        document.getElementById('attPercentage').textContent = (report.attendance_percentage || 0).toFixed(1) + '%';
        await loadRecentScans();
        await loadAttendanceLogs();
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

async function loadRecentScans() {
    try {
        const response = await fetch(API_BASE + '/attendance/recent-scans?limit=8');
        const scans = await response.json();
        renderRecentScans(scans);
    } catch (error) {
        console.error('Error loading recent scans:', error);
    }
}

function renderRecentScans(scans) {
    const container = document.getElementById('recentScansList');
    if (!container) return;

    if (!Array.isArray(scans) || scans.length === 0) {
        container.innerHTML = '<p>No scans yet</p>';
        return;
    }

    container.innerHTML = scans.map(scan => `
        <div class="scan-item">
            <div>
                <strong>${scan.student_name}</strong>
                <span class="scan-meta">ID: ${scan.student_code || `S${scan.student_id}`}</span>
                <span class="scan-meta">Card: ${scan.id_card_uid || '-'}</span>
                <span class="scan-meta">Method: ${scan.scan_method || 'id_card'}</span>
            </div>
            <div>
                <span class="status-badge ${scan.scan_type === 'check_in' ? 'paid' : 'pending'}">${scan.scan_type.replace('_', ' ')}</span>
            </div>
        </div>
    `).join('');
}

async function loadAttendanceLogs() {
    const date = document.getElementById('attendanceDate')?.value || '';
    const scanType = document.getElementById('attendanceLogTypeFilter')?.value || '';
    const search = document.getElementById('attendanceLogSearch')?.value || '';

    const params = new URLSearchParams({ limit: '200' });
    if (date) {
        params.set('date', date);
    }
    if (scanType) {
        params.set('scan_type', scanType);
    }
    if (search.trim()) {
        params.set('search', search.trim());
    }

    try {
        const response = await fetch(API_BASE + `/attendance/logs?${params.toString()}`);
        const logs = await response.json();

        if (!response.ok) {
            throw new Error(logs.error || 'Failed to load attendance logs');
        }

        currentData.attendanceLogs = Array.isArray(logs) ? logs : [];
        renderAttendanceLogs(currentData.attendanceLogs);
    } catch (error) {
        console.error('Error loading attendance logs:', error);
    }
}

function renderAttendanceLogs(logs) {
    const tbody = document.getElementById('attendanceLogTableBody');
    if (!tbody) return;

    if (!Array.isArray(logs) || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No attendance logs found</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const scannedAt = log.scanned_at ? new Date(log.scanned_at).toLocaleString() : '-';
        const statusClass = log.scan_type === 'check_in' ? 'paid' : 'pending';
        return `
            <tr>
                <td>${scannedAt}</td>
                <td>${log.student_name || '-'}</td>
                <td>${log.student_code || '-'}</td>
                <td>${log.id_card_uid || '-'}</td>
                <td>${log.scan_method || 'id_card'}</td>
                <td><span class="status-badge ${statusClass}">${(log.scan_type || '-').replace('_', ' ')}</span></td>
                <td>${log.location || '-'}</td>
                <td>${log.scan_value || '-'}</td>
            </tr>
        `;
    }).join('');
}

function normalizeScanValue(raw) {
    if (!raw) {
        return '';
    }

    return String(raw).trim().replace(/\s+/g, '').toUpperCase();
}

function extractScanPayload(raw) {
    if (!raw) {
        return { scanValue: '', source: 'manual_input' };
    }

    const trimmed = String(raw).trim();
    const normalized = normalizeScanValue(trimmed);

    if (!trimmed) {
        return { scanValue: '', source: 'manual_input' };
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            const payload = JSON.parse(trimmed);
            const candidate = payload.student_id || payload.student_code || payload.id_card_uid || payload.email || payload.scan_value || payload.value;
            return {
                scanValue: normalizeScanValue(candidate || ''),
                source: 'qr_scanner',
            };
        } catch (error) {
            // Fall back to plain text parsing when QR payload is not valid JSON.
        }
    }

    if (trimmed.toLowerCase().startsWith('student:')) {
        return {
            scanValue: normalizeScanValue(trimmed.split(':').slice(1).join(':')),
            source: 'qr_scanner',
        };
    }

    return { scanValue: normalized, source: 'manual_input' };
}

async function scanAttendanceById(options = {}) {
    const scanInput = document.getElementById('scanIdInput');
    const scanType = document.getElementById('scanTypeSelect');
    const scanResult = document.getElementById('scanResult');
    const attendanceDate = document.getElementById('attendanceDate');

    if (!scanInput || !scanType || !scanResult) return;

    const incomingRawValue = options.rawValue !== undefined ? options.rawValue : scanInput.value;
    const payload = extractScanPayload(incomingRawValue);
    const scanValue = payload.scanValue;
    const scanMethod = options.scanMethod || payload.source || 'manual_input';

    if (!scanValue) {
        showNotification('Error', 'Scan/enter ID card value first');
        return;
    }

    scanInput.value = scanValue;

    try {
        scanResult.className = 'scan-result';
        scanResult.innerHTML = '<p>Processing scan...</p>';

        const response = await fetch(API_BASE + '/attendance/scan-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scan_value: scanValue,
                scan_method: scanMethod,
                scan_type: scanType.value,
                attendance_date: attendanceDate ? attendanceDate.value : undefined
            })
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            scanResult.className = 'scan-result error';
            scanResult.innerHTML = `<p>${result.error || 'Failed to scan ID card'}</p>`;
            showNotification('Error', result.error || 'Failed to scan ID card');
            return;
        }

        scanResult.className = `scan-result ${result.already_scanned ? 'warning' : 'success'}`;
        scanResult.innerHTML = `
            <p><strong>${result.student.name}</strong>: ${result.message}</p>
            <p class="scan-meta">Student ID: ${result.student.student_id || '-'}</p>
            <p class="scan-meta">Card UID: ${result.student.id_card_uid || '-'}</p>
            <p class="scan-meta">Method: ${result.scan_method || scanMethod}</p>
        `;
        scanInput.value = '';
        await loadAttendanceData();
        await loadDashboardData();
    } catch (error) {
        console.error('Error scanning ID card:', error);
        showNotification('Error', 'Failed to scan ID card');
    }
}

async function startCameraScan() {
    if (cameraScanning) {
        return;
    }

    const scannerWrap = document.getElementById('cameraScannerWrap');
    const startBtn = document.getElementById('startCameraScanBtn');
    const stopBtn = document.getElementById('stopCameraScanBtn');
    const scanResult = document.getElementById('scanResult');

    if (!scannerWrap || !startBtn || !stopBtn) {
        return;
    }

    if (typeof Html5Qrcode === 'undefined') {
        showNotification('Error', 'Camera scanner library failed to load. Refresh and try again.');
        return;
    }

    scannerWrap.style.display = 'block';
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';

    cameraScanner = new Html5Qrcode('cameraScanner');

    const formatsToSupport = [];
    if (typeof Html5QrcodeSupportedFormats !== 'undefined') {
        formatsToSupport.push(
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF
        );
    }

    const scannerConfig = {
        fps: 10,
        qrbox: { width: 260, height: 180 },
        rememberLastUsedCamera: true,
        formatsToSupport,
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        }
    };

    try {
        await cameraScanner.start(
            { facingMode: 'environment' },
            scannerConfig,
            async (decodedText) => {
                const scanInput = document.getElementById('scanIdInput');
                const payload = extractScanPayload(decodedText);
                const normalized = payload.scanValue;
                if (scanInput) {
                    scanInput.value = normalized;
                }

                if (scanResult) {
                    scanResult.innerHTML = `<p>Scanned: <strong>${normalized}</strong></p>`;
                }

                await stopCameraScan();
                await scanAttendanceById({
                    rawValue: decodedText,
                    scanMethod: 'qr_scanner',
                });
            },
            () => {}
        );

        cameraScanning = true;
    } catch (error) {
        console.error('Failed to start camera scan:', error);
        await stopCameraScan();
        showNotification('Error', 'Unable to access camera. Check browser permissions.');
    }
}

async function stopCameraScan() {
    const scannerWrap = document.getElementById('cameraScannerWrap');
    const startBtn = document.getElementById('startCameraScanBtn');
    const stopBtn = document.getElementById('stopCameraScanBtn');

    if (cameraScanner) {
        try {
            if (cameraScanning) {
                await cameraScanner.stop();
            }
        } catch (error) {
            console.error('Failed to stop camera scan cleanly:', error);
        }

        try {
            await cameraScanner.clear();
        } catch (error) {
            console.error('Failed to clear camera scanner:', error);
        }
    }

    cameraScanner = null;
    cameraScanning = false;

    if (scannerWrap) {
        scannerWrap.style.display = 'none';
        const cameraDiv = document.getElementById('cameraScanner');
        if (cameraDiv) {
            cameraDiv.innerHTML = '';
        }
    }
    if (startBtn) {
        startBtn.style.display = 'inline-flex';
    }
    if (stopBtn) {
        stopBtn.style.display = 'none';
    }
}

function getInstantPaymentForm(meta) {
    const today = new Date().toISOString().split('T')[0];
    const lockStudentName = currentUser && currentUser.role === 'student';
    return `
        <form id="instantPaymentForm">
            <div class="form-group">
                <label>Bill Type</label>
                <input type="text" name="bill_type" value="${meta.billType}" readonly>
            </div>
            ${meta.billType === 'room' ? `
            <div class="form-group">
                <label>Room Number</label>
                <input type="text" name="room_number" value="${meta.roomNumber || ''}" readonly required>
            </div>
            ` : ''}
            <div class="form-group">
                <label>For</label>
                <input type="text" name="student_name" value="${meta.studentName}" ${lockStudentName ? 'readonly' : ''} required>
            </div>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" name="amount" value="${meta.amount}" min="1" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select name="payment_method" required>
                    <option value="online">Online</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                </select>
            </div>
            <div class="form-group">
                <label>Transaction Reference</label>
                <input type="text" name="transaction_ref" placeholder="Auto-generated if empty">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Pay Instantly</button>
            </div>
        </form>
    `;
}

function getFoodPaymentForm(meta, upiDetails) {
    const today = new Date().toISOString().split('T')[0];
    const studentName = (currentUser && currentUser.name) ? currentUser.name : (meta.studentName || 'Student');

    return `
        <form id="foodPaymentForm">
            <div class="food-pay-layout">
                <div class="food-pay-qr-wrap">
                    <img src="${upiDetails.qr_url}" alt="UPI QR Code" class="food-pay-qr" />
                    <p class="food-pay-note">Scan this QR in Google Pay / any UPI app</p>
                </div>
                <div class="food-pay-details">
                    <div class="form-group">
                        <label>Food Item</label>
                        <input type="text" value="${meta.itemName}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Amount (INR)</label>
                        <input type="text" value="${meta.amount}" readonly>
                    </div>
                    <div class="form-group">
                        <label>GPay Number</label>
                        <input type="text" value="${upiDetails.gpay_number}" readonly>
                    </div>
                    <div class="form-group">
                        <label>UPI ID</label>
                        <input type="text" value="${upiDetails.upi_id}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Student Name</label>
                        <input type="text" name="student_name" value="${studentName}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Transaction Reference</label>
                        <input type="text" name="transaction_ref" placeholder="Optional (auto-generated if empty)">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">I Paid - Confirm Order</button>
                    </div>
                </div>
            </div>
            <input type="hidden" name="menu_item_id" value="${meta.menuItemId}">
            <input type="hidden" name="paid_date" value="${today}">
        </form>
    `;
}

async function openFoodPaymentModal(menuItem) {
    const note = `Food-${menuItem.name}`;
    const params = new URLSearchParams({
        amount: String(menuItem.price || 0),
        note
    });

    try {
        const upiRes = await fetch(API_BASE + `/payments/upi-details?${params.toString()}`, {
            credentials: FETCH_CREDENTIALS,
        });
        const upiDetails = await upiRes.json().catch(() => ({}));
        if (!upiRes.ok) {
            showNotification('Error', upiDetails.error || 'Unable to load UPI details');
            return;
        }

        openModal('Pay for Food Order', getFoodPaymentForm({
            menuItemId: menuItem.id,
            itemName: menuItem.name,
            amount: menuItem.price || 0,
            studentName: menuItem.name,
        }, upiDetails));

        const form = document.getElementById('foodPaymentForm');
        if (!form) {
            return;
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const payload = Object.fromEntries(new FormData(form).entries());
            payload.payment_method = 'upi';
            if (!payload.transaction_ref || !payload.transaction_ref.trim()) {
                payload.transaction_ref = `FOOD-${Date.now()}-${payload.menu_item_id}`;
            }

            try {
                const confirmRes = await fetch(API_BASE + '/food-orders/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: FETCH_CREDENTIALS,
                    body: JSON.stringify(payload)
                });
                const confirmData = await confirmRes.json().catch(() => ({}));
                if (!confirmRes.ok) {
                    showNotification('Error', confirmData.error || 'Order confirmation failed');
                    return;
                }

                closeModal();
                await loadBillsData();
                await loadDashboardData();
                showNotification('Success', 'Payment verified and food order confirmed');
            } catch (error) {
                console.error('Food payment confirmation failed:', error);
                showNotification('Error', 'Unable to confirm food order');
            }
        });
    } catch (error) {
        console.error('Loading UPI details failed:', error);
        showNotification('Error', 'Unable to load QR code details');
    }
}

function openInstantPaymentModal(meta) {
    openModal(`Instant ${meta.title} Payment`, getInstantPaymentForm(meta));
    const form = document.getElementById('instantPaymentForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        const today = new Date().toISOString().split('T')[0];

        const billPayload = {
            student_name: payload.student_name,
            bill_type: payload.bill_type,
            room_number: payload.room_number || '',
            amount: payload.amount,
            due_date: today
        };

        try {
            const createRes = await fetch(API_BASE + '/bills/generate-monthly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billPayload)
            });
            const created = await createRes.json().catch(() => ({}));
            if (!createRes.ok) {
                showNotification('Error', created.error || 'Failed to create bill');
                return;
            }

            const payPayload = {
                paid_date: today,
                payment_method: payload.payment_method,
                transaction_ref: payload.transaction_ref || `TXN-${Date.now()}`
            };

            const payRes = await fetch(API_BASE + `/bills/${created.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payPayload)
            });
            const paid = await payRes.json().catch(() => ({}));
            if (!payRes.ok) {
                showNotification('Error', paid.error || 'Failed to pay bill');
                return;
            }

            closeModal();
            await loadBillsData();
            await loadDashboardData();
            showNotification('Success', 'Payment completed instantly');
        } catch (error) {
            console.error('Instant payment failed:', error);
            showNotification('Error', 'Instant payment failed');
        }
    });
}

async function loadBillsData() {
    try {
        const response = await fetch(API_BASE + '/bills');
        const bills = await response.json();
        const formattedBills = bills.map(bill => ({
            ...bill,
            ui_status: getBillUiStatus(bill)
        }));
        currentData.bills = formattedBills;
        renderBillsTable(formattedBills);
    } catch (error) {
        console.error('Error loading bills:', error);
    }
}

function getBillUiStatus(bill) {
    if (bill.status === 'paid') {
        return 'paid';
    }

    if (bill.status === 'pending' && bill.due_date) {
        const today = new Date().toISOString().split('T')[0];
        if (bill.due_date < today) {
            return 'overdue';
        }
    }

    return bill.status || 'pending';
}

function renderBillsTable(bills) {
    const tbody = document.getElementById('billsTableBody');
    if (!tbody) return;
    
    if (bills.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No bills found</td></tr>';
        return;
    }
    
    tbody.innerHTML = bills.map(bill => `
        <tr>
            <td>#${bill.id}</td>
            <td>${bill.student_name || 'N/A'}</td>
            <td>${bill.bill_type}</td>
            <td>${bill.room_number || '-'}</td>
            <td>₹${bill.amount}</td>
            <td>${bill.due_date || '-'}</td>
            <td><span class="status-badge ${bill.ui_status}">${bill.ui_status}</span></td>
            <td class="actions">
                ${bill.status !== 'paid' ? `<button class="btn-icon" onclick="payBill(${bill.id})" title="Pay"><i class="fas fa-check"></i></button>` : ''}
            </td>
        </tr>
    `).join('');
}

function filterBills() {
    const status = document.getElementById('billStatusFilter').value;
    let filtered = currentData.bills;
    
    if (status) {
        filtered = filtered.filter(b => b.ui_status === status);
    }
    
    renderBillsTable(filtered);
}

async function loadFeedbackData() {
    try {
        const response = await fetch(API_BASE + '/feedback');
        const feedback = await response.json();
        currentData.feedback = feedback;
        renderFeedbackList(feedback);
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

function renderFeedbackList(feedback) {
    const list = document.getElementById('feedbackList');
    if (!list) return;
    
    if (feedback.length === 0) {
        list.innerHTML = '<p style="text-align: center;">No feedback found</p>';
        return;
    }
    
    list.innerHTML = feedback.map(item => `
        <div class="feedback-item ${item.priority}">
            <div class="feedback-header">
                <div class="feedback-subject">${item.subject}</div>
                <div class="feedback-meta">
                    <span class="feedback-priority ${item.priority}">${item.priority}</span>
                    <span class="feedback-status ${item.status}">${item.status.replace('_', ' ')}</span>
                </div>
            </div>
            <div class="feedback-description">${item.description}</div>
            <div class="feedback-footer">
                <span class="feedback-student">By: ${item.student_name || 'Anonymous'}</span>
                <span class="feedback-date">${new Date(item.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

function filterFeedback() {
    const category = document.getElementById('feedbackCategoryFilter').value;
    const status = document.getElementById('feedbackStatusFilter').value;
    
    let filtered = currentData.feedback;
    
    if (category) {
        filtered = filtered.filter(f => f.category === category);
    }
    
    if (status) {
        filtered = filtered.filter(f => f.status === status);
    }
    
    renderFeedbackList(filtered);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function showNotification(type, message) {
    // Simple notification - can be enhanced with toast notifications
    alert(`${type}: ${message}`);
}

function getStudentDetailsView(student) {
    return `
        <div class="student-view">
            <div class="form-group"><label>Student ID</label><input type="text" value="${student.student_id || '-'}" readonly></div>
            <div class="form-group"><label>ID Card UID</label><input type="text" value="${student.id_card_uid || '-'}" readonly></div>
            <div class="form-group"><label>Name</label><input type="text" value="${student.name || '-'}" readonly></div>
            <div class="form-group"><label>Email</label><input type="text" value="${student.email || '-'}" readonly></div>
            <div class="form-group"><label>Department</label><input type="text" value="${student.department || '-'}" readonly></div>
            <div class="form-group"><label>Year</label><input type="text" value="${student.year || '-'}" readonly></div>
            <div class="form-group"><label>Status</label><input type="text" value="${student.status || '-'}" readonly></div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
}

function getStudentEditForm(student) {
    const safe = (value) => value === null || value === undefined ? '' : String(value);
    return `
        <form id="studentEditForm">
            <div class="form-group">
                <label>Student ID</label>
                <input type="text" name="student_id" value="${safe(student.student_id)}" required>
            </div>
            <div class="form-group">
                <label>ID Card UID</label>
                <input type="text" name="id_card_uid" value="${safe(student.id_card_uid)}" required>
            </div>
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" value="${safe(student.name)}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${safe(student.email)}" required>
            </div>
            <div class="form-group">
                <label>Login Password (leave blank to keep unchanged)</label>
                <input type="password" name="login_password" placeholder="Optional">
            </div>
            <div class="form-group">
                <label>Department</label>
                <input type="text" name="department" value="${safe(student.department)}" required>
            </div>
            <div class="form-group">
                <label>Year</label>
                <select name="year">
                    <option value="1" ${Number(student.year) === 1 ? 'selected' : ''}>1st Year</option>
                    <option value="2" ${Number(student.year) === 2 ? 'selected' : ''}>2nd Year</option>
                    <option value="3" ${Number(student.year) === 3 ? 'selected' : ''}>3rd Year</option>
                    <option value="4" ${Number(student.year) === 4 ? 'selected' : ''}>4th Year</option>
                </select>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="active" ${student.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${student.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update</button>
            </div>
        </form>
    `;
}

// Global functions for inline onclick handlers
window.viewStudent = async function(id) {
    try {
        const response = await fetch(API_BASE + `/students/${id}`);
        const student = await response.json().catch(() => ({}));

        if (!response.ok) {
            showNotification('Error', student.error || 'Failed to load student details');
            return;
        }

        openModal(`Student Details #${id}`, getStudentDetailsView(student));
    } catch (error) {
        console.error('View student failed:', error);
        showNotification('Error', 'Failed to load student details');
    }
};

window.editStudent = async function(id) {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Error', 'Only admin can edit student records');
        return;
    }

    try {
        const response = await fetch(API_BASE + `/students/${id}`);
        const student = await response.json().catch(() => ({}));

        if (!response.ok) {
            showNotification('Error', student.error || 'Failed to load student');
            return;
        }

        openModal(`Edit Student #${id}`, getStudentEditForm(student));
        const form = document.getElementById('studentEditForm');
        if (!form) {
            return;
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());

            try {
                const updateResponse = await fetch(API_BASE + `/students/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await updateResponse.json().catch(() => ({}));
                if (!updateResponse.ok) {
                    showNotification('Error', result.error || 'Failed to update student');
                    return;
                }

                closeModal();
                await loadStudentsData();
                showNotification('Success', 'Student updated successfully');
            } catch (error) {
                console.error('Edit student failed:', error);
                showNotification('Error', 'Failed to update student');
            }
        });
    } catch (error) {
        console.error('Load student for edit failed:', error);
        showNotification('Error', 'Failed to load student');
    }
};

function openPaymentModal(id) {
    const bill = currentData.bills.find(item => item.id === id);
    if (!bill) {
        showNotification('Error', 'Bill not found');
        return;
    }

    openModal(`Pay Bill #${id}`, getPaymentForm(bill));

    const form = document.getElementById('paymentForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(API_BASE + `/bills/${id}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                closeModal();
                await loadBillsData();
                await loadDashboardData();
                showNotification('Success', 'Payment recorded successfully');
            } else {
                const errorData = await response.json().catch(() => ({}));
                showNotification('Error', errorData.error || 'Failed to process payment');
            }
        } catch (error) {
            console.error('Error paying bill:', error);
            showNotification('Error', 'Failed to process payment');
        }
    });
}

window.payBill = function(id) {
    openPaymentModal(id);
};

window.instantPayRoom = function(roomId) {
    const room = currentData.rooms.find(r => r.id === roomId);
    if (!room) {
        showNotification('Error', 'Room not found');
        return;
    }

    openInstantPaymentModal({
        title: 'Room Rent',
        billType: 'room',
        roomNumber: room.room_number,
        studentName: (currentUser && currentUser.role === 'student') ? (currentUser.name || 'Student') : `Room ${room.room_number}`,
        amount: room.monthly_rent || 5000
    });
};

window.instantPayFood = function(menuId) {
    const item = currentData.menu.find(m => m.id === menuId);
    if (!item) {
        showNotification('Error', 'Food item not found');
        return;
    }

    openFoodPaymentModal(item);
};

window.vacateRoom = async function(roomId) {
    const room = currentData.rooms.find(r => r.id === roomId);
    if (!room) {
        showNotification('Error', 'Room not found');
        return;
    }

    const currentOccupancy = Number(room.current_occupancy || 0);
    if (currentOccupancy <= 0) {
        showNotification('Error', `Room ${room.room_number} is already vacant`);
        return;
    }

    const confirmed = window.confirm(`Vacate 1 student from Room ${room.room_number}?`);
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(API_BASE + `/rooms/${roomId}/vacate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            showNotification('Error', data.error || 'Failed to vacate room');
            return;
        }

        await loadRoomsData();
        await loadDashboardData();
        showNotification('Success', data.message || 'Room occupancy updated');
    } catch (error) {
        console.error('Vacate room failed:', error);
        showNotification('Error', 'Failed to vacate room');
    }
};
