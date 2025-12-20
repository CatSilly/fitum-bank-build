document.addEventListener('DOMContentLoaded', () => {
    // Thay URL này bằng URL bạn nhận được từ Localtunnel (phải có wss://)
    const WS_URL = 'wss://fitum-db.loca.lt'; 
    let socket;

    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const loginSection = document.getElementById('login-section');
    const balanceSection = document.getElementById('balance-section');

    function connect() {
        socket = new WebSocket(WS_URL);

        socket.onopen = () => console.log("Đã kết nối Server");
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'LOGIN_SUCCESS') {
                loginSection.classList.add('hidden');
                balanceSection.classList.remove('hidden');
                
                document.getElementById('holder-name').textContent = data.account.accountHolder;
                document.getElementById('account-number').textContent = data.account.accountNumber;
                document.getElementById('current-balance').textContent = 
                    new Intl.NumberFormat('en-US').format(data.account.balance) + ' ' + data.currency;
                
                document.getElementById('account-info').classList.remove('hidden');
                document.querySelector('.loading-message').classList.add('hidden');
            } else if (data.type === 'LOGIN_ERROR') {
                loginMessage.textContent = data.message;
            }
        };

        socket.onclose = () => setTimeout(connect, 2000); // Tự động kết nối lại nếu mất mạng
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
            type: 'LOGIN',
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        socket.send(JSON.stringify(payload));
    });

    connect();
});
