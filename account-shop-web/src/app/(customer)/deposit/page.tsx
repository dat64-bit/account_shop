"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CreditCard, RefreshCw, CheckCircle, Copy, ArrowLeft, Info } from 'lucide-react';

interface UserData {
  id: number;
  sub: string; // username
  email: string;
  role: string;
  balance: number;
}

export default function DepositPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    const userStr = localStorage.getItem('user_info');

    if (!userStr) {
      setTimeout(() => router.push('/'), 0);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (isMounted) setUser(userData);

      // Fetch fresh balance — guard với isMounted để tránh setState trên unmounted component
      import('@/lib/axios').then(({ default: api }) => {
        api.get('/auth/me')
          .then(res => {
            if (isMounted && res.data) {
              setUser(prev => prev ? {
                ...prev,
                id: res.data.accountId || prev.id,
                balance: res.data.balance ?? null
              } : null);
            }
          })
          .catch(console.error);
      });

    } catch (e) {
      console.error(e);
      setTimeout(() => router.push('/'), 0);
    }

    // Cleanup: đánh dấu component đã unmount để ngăn setState bất đồng bộ
    return () => { isMounted = false; };
  }, []);

  // Cleanup copyTimeout khi unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  if (!user) return (
    <div className="page-loading-screen">
      <div className="page-loading-text">Đang tải...</div>
    </div>
  );

  const bankName = "MBBank";
  const bankAccount = "0963319827";
  const accountName = "NGUYEN VAN DAT";
  const transferContent = `NAP ${user.id || '...'}`;

  // VietQR URL format without amount: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  // Template: compact or print
  const qrUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact.png?addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <main className="dashboard-page">
        <div className="container deposit-container">

          <button
            onClick={() => router.push('/dashboard')}
            className="btn-text btn-back-dashboard"
          >
            <ArrowLeft size={16} /> Quay lại Dashboard
          </button>

          <div className="content-card animate-in deposit-card">
            <div className="card-header deposit-header">
              <h1 className="card-title deposit-title">
                <CreditCard size={28} color="var(--primary)" />
                Nạp tiền vào tài khoản
              </h1>
              <p className="card-subtitle deposit-subtitle">
                Quét mã QR bằng ứng dụng ngân hàng hoặc Momo để nạp tiền tự động 24/7.
              </p>
            </div>

            <div className="deposit-grid">

              {/* Left: Info */}
              <div>
                <div className="account-item-card deposit-info-card">
                  <div className="account-card-head deposit-info-head">
                    <strong className="deposit-info-title">Thông tin chuyển khoản</strong>
                  </div>

                  <div className="account-card-body">
                    <div className="account-field deposit-field">
                      <span className="label">Ngân hàng:</span>
                      <div className="value-box">
                        <strong className="text-primary">{bankName}</strong>
                      </div>
                    </div>
                    <div className="account-field deposit-field">
                      <span className="label">Chủ tài khoản:</span>
                      <div className="value-box">
                        <strong>{accountName}</strong>
                      </div>
                    </div>
                    <div className="account-field deposit-field">
                      <span className="label">Số tài khoản:</span>
                      <div className="value-box">
                        <strong className="text-lg">{bankAccount}</strong>
                        <button className="btn-copy" onClick={() => handleCopy(bankAccount)} title="Copy">
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="account-field">
                      <span className="label">Nội dung chuyển khoản (Bắt buộc):</span>
                      <div className="value-box highlight">
                        <strong className="text-lg text-red">{transferContent}</strong>
                        <button className="btn-copy red" onClick={() => handleCopy(transferContent)} title="Copy">
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="auth-message auth-error align-start">
                  <Info size={18} className="icon-info" />
                  <div>
                    <strong className="note-title">Lưu ý quan trọng:</strong>
                    <ul className="note-list">
                      <li>Bắt buộc ghi đúng <strong>Nội dung chuyển khoản</strong> để hệ thống cộng tiền tự động.</li>
                      <li>Tiền sẽ được cộng vào tài khoản trong vòng 1-3 phút.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right: QR Code */}
              <div className="deposit-qr-section">
                <h3 className="qr-title">Quét mã để thanh toán</h3>
                <div className="qr-box">
                  <img src={qrUrl} alt="Mã QR Thanh Toán" className="qr-img" />
                </div>

                {copied && (
                  <div className="auth-message auth-success success-msg">
                    <CheckCircle size={18} /> Đã sao chép!
                  </div>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className={`btn-text btn-refresh ${copied ? 'copied' : ''}`}
                >
                  <RefreshCw size={16} /> Kiểm tra số dư (F5)
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </>
  );
}
