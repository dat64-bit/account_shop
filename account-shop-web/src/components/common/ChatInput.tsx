"use client";

import React from 'react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  orders?: any[];
  selectedOrderId?: string;
  onSelectOrderId?: (orderId: string) => void;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Nhập tin nhắn...",
  orders,
  selectedOrderId,
  onSelectOrderId
}: ChatInputProps) {
  const hasOrders = orders && orders.length > 0 && onSelectOrderId !== undefined;

  return (
    <div className="chat-input-container">
      {hasOrders && (
        <select
          value={selectedOrderId}
          onChange={(e) => onSelectOrderId(e.target.value)}
          disabled={disabled}
          className="chat-input-select"
        >
          <option value="">(Không đính kèm mã đơn)</option>
          {orders.map((o) => (
            <option key={o.orderId} value={o.orderId}>
              #{o.orderId} - {o.productName}
            </option>
          ))}
        </select>
      )}

      <input
        type="text"
        className="form-input chat-input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !disabled && value.trim()) {
            onSend();
          }
        }}
        disabled={disabled}
      />

      <button
        className="btn-primary chat-input-btn"
        onClick={onSend}
        disabled={disabled || !value.trim()}
      >
        Gửi
      </button>
    </div>
  );
}
