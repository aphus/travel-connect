import React from 'react';
import { AdminReport } from '@/services/admin';

export default function UserReportHistory({ userId, allReports }: { userId: string, allReports: AdminReport[] }) {
    const history = allReports.filter(r => r.reported_id === userId || r.reporter?.id === userId);

    if (history.length === 0) return <p className="text-sm text-slate-400 italic">Không có lịch sử báo cáo.</p>;

    return (
        <div className="space-y-3">
            {history.map((report) => (
                <div key={report.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <p className="font-bold text-slate-700">{report.reason}</p>
                    <p className="text-slate-500 mt-1">{report.description}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{report.status}</span>
                </div>
            ))}
        </div>
    );
}