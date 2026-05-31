"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import api from '@/lib/axios';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReplies, setTicketReplies] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast, showToast } = useAdminToast();

  // Filters & Keyset Pagination States
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 1000);
    return () => clearTimeout(handler);
  }, [keyword]);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cursors, setCursors] = useState<(number | null)[]>([null]);

  const fetchTickets = async (lastId: number | null, page: number) => {
    setLoading(true);
    try {
      let url = `/admin/tickets?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (statusFilter !== undefined) url += `&statusId=${statusFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await api.get(url);
      setTickets(res.data.content || []);
      setHasMore(res.data.hasMore || false);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast('Phiên đăng nhập hết hạn hoặc không có quyền truy cập.', 'error');
      } else {
        showToast('Lỗi tải danh sách ticket hoặc kết nối máy chủ.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketReplies = async (ticketId: number) => {
    try {
      const res = await api.get(`/user/tickets/${ticketId}/replies`);
      setTicketReplies(res.data);
    } catch (error) {
      console.error("Error fetching replies:", error);
      showToast('Lỗi tải nội dung phản hồi hoặc kết nối máy chủ.', 'error');
    }
  };

  const handleOpenTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    fetchTicketReplies(ticket.ticketId);
  };

  const handleSendReply = async () => {
    if (!adminReply.trim()) return;
    try {
      await api.post(`/user/tickets/${selectedTicket.ticketId}/replies`, { message: adminReply });
      setAdminReply('');
      fetchTicketReplies(selectedTicket.ticketId);
      showToast('Gửi phản hồi thành công.', 'success');
    } catch (error) {
      console.error("Error sending reply:", error);
      showToast('Lỗi gửi phản hồi hoặc kết nối.', 'error');
    }
  };

  const handleResolveTicket = async (newStatus: number) => {
    try {
      await api.put(`/admin/tickets/${selectedTicket.ticketId}/status?statusId=${newStatus}`);
      fetchTickets(cursors[currentPage - 1], currentPage);
      setSelectedTicket(null);
      showToast('Cập nhật trạng thái ticket thành công.', 'success');
    } catch (error) {
      console.error("Error resolving ticket:", error);
      showToast('Không thể cập nhật trạng thái hoặc lỗi kết nối.', 'error');
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (isMounted) {
      setCursors([null]);
      fetchTickets(null, 1);
    }
  }, [statusFilter, debouncedKeyword, isMounted]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchTickets(prevLastId, prevPage);
    }
  };

  const handleNext = () => {
    if (hasMore && tickets.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = tickets[tickets.length - 1].ticketId;
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchTickets(currentLastId, nextPage);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="space-y-6">
        <AdminTableCard title="Danh sách Ticket hỗ trợ">
          {/* Bộ lọc động */}
          <div className="admin-filter-bar">
            <div className="admin-filter-search-wrapper">
              <input
                type="text"
                placeholder="Tìm theo tên người dùng (username)..."
                className="admin-filter-input"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <div className="admin-filter-select-wrapper">
              <select
                className="admin-filter-select"
                value={statusFilter === undefined ? 'all' : statusFilter.toString()}
                onChange={e => {
                  const val = e.target.value;
                  setStatusFilter(val === 'all' ? undefined : parseInt(val));
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Chờ xử lý (Pending)</option>
                <option value="3">Đang xử lý (In Progress)</option>
                <option value="2">Đã xong (Completed)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="table-loading-cell">Đang tải danh sách ticket...</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Người dùng</th>
                      <th>Chủ đề</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td className="table-empty-cell" colSpan={6}>Không tìm thấy ticket nào.</td>
                      </tr>
                    ) : (
                      tickets.map(t => (
                        <tr key={t.ticketId}>
                          <td>#{t.ticketId}</td>
                          <td>{t.username || 'Khách'}</td>
                          <td><strong>{t.issueType}</strong></td>
                          <td>
                            <span className={`admin-badge ${t.ticketStatusId === 1 ? 'danger' : t.ticketStatusId === 2 ? 'success' : 'warning'}`}>
                              {t.ticketStatusId === 1 ? 'Chờ xử lý' : t.ticketStatusId === 2 ? 'Đã xong' : 'Đang xử lý'}
                            </span>
                          </td>
                          <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="admin-actions-cell">
                            <div className="admin-table-actions">
                              <button className="btn-admin-action edit" onClick={() => handleOpenTicket(t)}>Xử lý ngay</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <AdminPagination
                currentPage={currentPage}
                hasMore={hasMore}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            </>
          )}
        </AdminTableCard>

        {/* Giao diện Chat/Xử lý Ticket */}
        {selectedTicket && (
          <div className="content-card animate-in">
            <div className="card-header">
              <h2 className="card-title">Xử lý Ticket #{selectedTicket.ticketId}</h2>
              <button className="btn-close" onClick={() => setSelectedTicket(null)}>&times;</button>
            </div>
            <div className="admin-chat-layout">
              <div className="chat-messages">
                {ticketReplies.map((reply, idx) => (
                  <div key={idx} className={`chat-bubble ${reply.isAdmin ? 'admin' : 'user'}`}>
                    <div className={`bubble-content ${reply.isAdmin ? 'admin-bubble' : 'user-bubble'}`}>
                      {reply.message}
                      <div className="bubble-timestamp">{new Date(reply.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}

                {ticketReplies.length === 0 && <div className="text-center text-muted py-10">Chưa có phản hồi nào.</div>}
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập nội dung phản hồi..."
                  value={adminReply}
                  onChange={e => setAdminReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                />
                <button className="btn-primary" onClick={handleSendReply}>Gửi</button>
              </div>

              <div className="chat-action-bar">
                <button className="btn-view-account btn-resolve-success" onClick={() => handleResolveTicket(2)}>Xong (Hoàn tất)</button>
                <button className="btn-view-account btn-resolve-pending" onClick={() => handleResolveTicket(3)}>Đang xử lý</button>
                <button className="btn-view-account btn-close-chat" onClick={() => setSelectedTicket(null)}>Đóng hội thoại</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminToast toast={toast} />
    </>
  );
}
