"use client";

import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user_info');
    if (storedUserStr) {
      try {
        setUserInfo(JSON.parse(storedUserStr));
      } catch {}
    }
  }, []);

  return (
    <div className="content-card animate-in">
      <div className="card-header">
        <h2 className="card-title">Thông tin tài khoản</h2>
        <p className="card-subtitle">Cập nhật thông tin cá nhân và mật khẩu</p>
      </div>
      <div className="profile-form-body">
        <div className="profile-form-grid">
          <div className="form-group">
            <label>Họ và tên</label>
            <div className="input-wrapper">
              <input type="text" defaultValue={userInfo?.sub || ''} />
            </div>
          </div>
          <div className="form-group">
            <label>Địa chỉ Email</label>
            <div className="input-wrapper">
              <input type="email" defaultValue={userInfo?.email || ''} disabled />
            </div>
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <div className="input-wrapper">
              <input type="text" placeholder="Chưa cập nhật" />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={isChangingPassword} 
                onChange={(e) => setIsChangingPassword(e.target.checked)} 
                style={{ width: 'auto' }}
              />
              <span style={{ fontWeight: 500 }}>Đổi mật khẩu</span>
            </label>
          </div>

          {isChangingPassword && (
            <>
              <div className="form-group animate-in fade-in slide-in-from-top-2">
                <label>Mật khẩu hiện tại</label>
                <div className="input-wrapper">
                  <input type="password" placeholder="Nhập mật khẩu hiện tại" />
                </div>
              </div>
              <div className="form-group animate-in fade-in slide-in-from-top-2">
                <label>Mật khẩu mới</label>
                <div className="input-wrapper">
                  <input type="password" placeholder="Nhập mật khẩu mới" />
                </div>
              </div>
            </>
          )}
        </div>
        <button className="btn-submit btn-profile-submit">
          Cập nhật thông tin
        </button>
      </div>
    </div>
  );
}
