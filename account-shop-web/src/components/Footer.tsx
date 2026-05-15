export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Cột 1: Logo & Thông tin công ty */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="VanDatPremium Logo" className="logo-img" style={{ height: 40 }} />
            <div>VanDat<span>Premium</span></div>
          </div>
          <p className="footer-company">HỆ THỐNG TÀI KHOẢN SỐ VANDATPREMIUM</p>
          <p className="footer-license">Cung cấp giải pháp giải trí và làm việc bản quyền hàng đầu Việt Nam.</p>
          <div className="footer-contact-list">
            <div className="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>Hà Nội, Việt Nam</span>
            </div>
            <div className="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Phục vụ 24/7 (Hỗ trợ kỹ thuật 8:00 - 22:00)</span>
            </div>
            <div className="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>Hotline/Zalo: 0xxx xxx xxx</span>
            </div>
            <div className="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>contact@vandatpremium.vn</span>
            </div>
          </div>
        </div>

        {/* Cột 2: Thông tin */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">VỀ CHÚNG TÔI</h4>
          <ul>
            <li><a href="#">Giới thiệu VanDatPremium</a></li>
            <li><a href="#">Hướng dẫn thanh toán</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
            <li><a href="#">Tuyển dụng cộng tác viên</a></li>
            <li><a href="#">Liên hệ hợp tác</a></li>
          </ul>
        </div>

        {/* Cột 3: Chính sách */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">CHÍNH SÁCH CỬA HÀNG</h4>
          <ul>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Chính sách hoàn tiền 100%</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Quy định bảo hành sản phẩm</a></li>
          </ul>
          <h4 className="footer-col-title" style={{ marginTop: 20 }}>CAM KẾT DỊCH VỤ</h4>
          <ul>
            <li><a href="#">Sản phẩm chính hãng</a></li>
            <li><a href="#">Hỗ trợ kỹ thuật 24/7</a></li>
            <li><a href="#">Bảo hành trọn đời bộ tài khoản</a></li>
          </ul>
        </div>

        {/* Cột 4: Mạng xã hội */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">KẾT NỐI VỚI CHÚNG TÔI</h4>
          <div className="footer-socials">
            <a href="#" className="social-btn facebook" title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="social-btn youtube" title="Youtube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
              </svg>
            </a>
            <a href="#" className="social-btn tiktok" title="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.56V6.79a4.85 4.85 0 0 1-1.07-.1z" />
              </svg>
            </a>
          </div>

          <h4 className="footer-col-title" style={{ marginTop: 20 }}>PHƯƠNG THỨC THANH TOÁN</h4>
          <div className="payment-methods">
            <span className="payment-badge">Chuyển khoản Ngân hàng</span>
            <span className="payment-badge">Ví Momo / ZaloPay</span>
            <span className="payment-badge">Thẻ cào tự động</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2025 VanDatPremium. Bản quyền thuộc về đội ngũ phát triển.</span>
          <span>Hệ thống vận hành bởi <strong>VanDat Team</strong></span>
        </div>
      </div>
    </footer>
  );
}
