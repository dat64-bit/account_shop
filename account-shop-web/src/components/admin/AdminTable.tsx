import React from 'react';

export interface Column {
    title: React.ReactNode;
    dataIndex: string;
    render?: (text: any, record: any) => React.ReactNode;
    width?: string | number;
}

export interface AdminTableProps {
    columns: Column[];
    data: any[];
    rowKey?: string | ((record: any) => string | number);
    emptyText?: React.ReactNode;
}

export function AdminTable({ columns, data, rowKey, emptyText = 'Không có dữ liệu' }: AdminTableProps) {
    const getRowKey = (record: any, index: number) => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        if (typeof rowKey === 'string' && record[rowKey] !== undefined) {
            return record[rowKey];
        }
        return index;
    };

    return (
        <div className="table-responsive">
            <table className="admin-table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={{ width: col.width }}>
                                {col.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={getRowKey(row, rowIndex)}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render
                                            ? col.render(row[col.dataIndex], row)
                                            : row[col.dataIndex]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="table-empty-cell" colSpan={columns.length}>
                                {emptyText}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// Keep default export for backward compatibility if needed, but named export is better
export default AdminTable;