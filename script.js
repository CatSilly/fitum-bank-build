document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO CÁC PHẦN TỬ GIAO DIỆN ---
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');
    const loginSection = document.getElementById('login-section');
    const balanceSection = document.getElementById('balance-section');

    const balanceElement = document.getElementById('current-balance');
    const holderNameElement = document.getElementById('holder-name');
    const accountNumberElement = document.getElementById('account-number');
    const loadingMessage = document.querySelector('.loading-message');
    const accountInfo = document.getElementById('account-info');
    
    let bankData = null; // Lưu trữ toàn bộ dữ liệu JSON (bao gồm cả danh sách accounts)
    let loggedInAccount = null; // Lưu thông tin tài khoản đang đăng nhập

    // --- HÀM FORMAT TIỀN TỆ ---
    function formatCurrency(amount, currency) {
        return new Intl.NumberFormat('en-US', { 
            style: 'decimal', 
            minimumFractionDigits: 2 
        }).format(amount) + ' ' + currency;
    }

    // --- HÀM TẢI DỮ LIỆU TỪ JSON ---
    async function loadData() {
        loadingMessage.textContent = 'Đang khởi động hệ thống...';
        try {
            const response = await fetch('data.json'); 
            
            if (!response.ok) {
                throw new Error(`Lỗi tải dữ liệu: ${response.status}`);
            }

            bankData = await response.json();
            
            // Dọn dẹp loading message
            loadingMessage.textContent = ''; 

        } catch (error) {
            console.error("Không thể tải dữ liệu cấu hình:", error);
            loginMessage.textContent = 'LỖI HỆ THỐNG: Không thể tải cấu hình ngân hàng.';
            loginMessage.style.color = '#dc3545';
        }
    }
    
    // --- HÀM HIỂN THỊ SỐ DƯ (Sử dụng dữ liệu của tài khoản đã đăng nhập) ---
    function displayBalance() {
        if (!loggedInAccount || !bankData) return;

        // Cập nhật giao diện từ biến loggedInAccount
        holderNameElement.textContent = loggedInAccount.accountHolder;
        accountNumberElement.textContent = loggedInAccount.accountNumber;
        // Sử dụng đơn vị tiền tệ từ bankData.currency
        balanceElement.textContent = formatCurrency(loggedInAccount.balance, bankData.currency);
        
        // Ẩn thông báo tải, hiện thông tin
        loadingMessage.classList.add('hidden');
        accountInfo.classList.remove('hidden');
    }

// --- THÊM HÀM BĂM SHA256 ---
function hashSHA256(str) {
    // CryptoJS phải được tải từ CDN trong index.html
    return CryptoJS.SHA256(str).toString();
}

// --- LOGIC ĐĂNG NHẬP (Đã cập nhật) ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const username = usernameInput.value.trim();
    const rawPassword = passwordInput.value.trim(); // Lấy mật khẩu thô
    
    if (!bankData || !bankData.accounts) {
         loginMessage.textContent = 'Hệ thống chưa sẵn sàng. Vui lòng thử lại sau.';
         return;
    }
    
    // Băm mật khẩu thô do người dùng nhập
    const hashedPassword = hashSHA256(rawPassword);

    // Tìm kiếm thông tin đăng nhập trong mảng accounts, so sánh với chuỗi đã băm
    const accountFound = bankData.accounts.find(
        // CHỈ SO SÁNH CHUỖI ĐÃ BĂM
        a => a.username === username && a.password === hashedPassword
    );

    if (accountFound) {
        // Đăng nhập thành công
        loggedInAccount = accountFound;
        loginMessage.textContent = '';
        
        // Ẩn/Hiện giao diện
        loginSection.classList.add('hidden');
        balanceSection.classList.remove('hidden');

        // Hiển thị số dư
        displayBalance();

    } else {
        // Đăng nhập thất bại
        loginMessage.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        passwordInput.value = ''; 
    }
});


    // Gọi hàm tải dữ liệu ngay khi trang được tải
    loadData();
});
