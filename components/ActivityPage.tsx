
import React, { useMemo } from 'react';
import type { ActivityLog } from '../types';
import { Icons } from './icons';

interface ActivityPageProps {
    activityLogs: ActivityLog[];
}

interface MetricCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    delay?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, icon: Icon, gradient, iconBg, delay = '0ms' }) => (
    <div
        className="glass-card rounded-2xl p-5 relative overflow-hidden group hover-lift"
    >
        {/* Background gradient decoration */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full ${gradient} blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>

        {/* Icon with glow */}
        <div className="relative z-10 flex justify-between items-start mb-5">
            <div className={`relative p-3 rounded-2xl ${iconBg} border border-white/10 shadow-lg`}>
                <div className={`absolute inset-0 ${gradient} opacity-20 blur-xl rounded-2xl`}></div>
                <Icon className="relative w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
                <Icons.Activity className="w-3 h-3" />
                <span className="text-[10px] font-medium">Live</span>
            </div>
        </div>

        {/* Value */}
        <div className="relative z-10">
            <p className="text-3xl font-display font-bold text-white tracking-tight">{value}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{title}</p>
            {subValue && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    <p className="text-[10px] text-gray-500 font-medium">{subValue}</p>
                </div>
            )}
        </div>
    </div>
);

const ActivityPage: React.FC<ActivityPageProps> = ({ activityLogs }) => {
    const logs: ActivityLog[] = activityLogs;
    const isScrollable = logs.length > 20;

    const stats = useMemo(() => {
        const total = logs.length;
        const extractions = logs.filter(l => l.action === 'Extraction').length;
        const exports = logs.filter(l => l.action === 'Export' && l.status === 'OK').length;
        const errors = logs.filter(l => l.status === 'ERR').length;

        const successRate = total > 0 ? ((total - errors) / total) * 100 : 100;

        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        const last24h = logs.filter(l => new Date(l.timestamp) > oneDayAgo).length;

        return {
            extractions,
            exports,
            successRate: successRate.toFixed(1),
            last24h
        };
    }, [logs]);

    const getStatusBadge = (status: 'OK' | 'ERR' | 'WARN') => {
        switch (status) {
            case 'OK': return <span className="badge badge-success text-[10px] py-0.5">OK</span>;
            case 'ERR': return <span className="badge badge-error text-[10px] py-0.5">ERR</span>;
            case 'WARN': return <span className="badge badge-warning text-[10px] py-0.5">WARN</span>;
        }
    };

    const getActionDisplay = (action: ActivityLog['action']) => {
        switch (action) {
            case 'Extraction': return { icon: Icons.New, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Extraction' };
            case 'Deletion': return { icon: Icons.Delete, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Deletion' };
            case 'Login': return { icon: Icons.Logout, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Sign In', style: 'transform -scale-x-100' };
            case 'Logout': return { icon: Icons.Logout, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Sign Out' };
            case 'Export': return { icon: Icons.Share2, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'MAM Export' };
            case 'Modification': return { icon: Icons.Pencil, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Modification' };
            default: return { icon: Icons.Activity, color: 'text-gray-400', bg: 'bg-gray-500/10', label: action, style: '' };
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header>
                <h1 className="font-display text-3xl font-bold text-white tracking-tight">Activity Monitor</h1>
                <p className="mt-1 text-gray-400 text-sm">Track all system operations and performance metrics</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard
                    title="Rosters Extracted"
                    value={stats.extractions}
                    subValue="Total successful AI queries"
                    icon={Icons.Library}
                    gradient="bg-emerald-500"
                    iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
                    delay="0ms"
                />
                <MetricCard
                    title="Iconik Exports"
                    value={stats.exports}
                    subValue="Metadata syncs to MAM"
                    icon={Icons.Share2}
                    gradient="bg-purple-500"
                    iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
                    delay="100ms"
                />
                <MetricCard
                    title="Reliability Score"
                    value={`${stats.successRate}%`}
                    subValue="Operational success rate"
                    icon={Icons.Activity}
                    gradient="bg-blue-500"
                    iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
                    delay="200ms"
                />
                <MetricCard
                    title="24h Volume"
                    value={stats.last24h}
                    subValue="Operations in last day"
                    icon={Icons.Calendar}
                    gradient="bg-amber-500"
                    iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
                    delay="300ms"
                />
            </div>

            {/* Activity Log Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="h-12 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center px-5 gap-4">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="h-5 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2.5">
                        <Icons.Activity className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-gray-300 tracking-wide">Session Log</span>
                        <span className="badge badge-primary text-[9px] py-0.5">{logs.length} entries</span>
                    </div>
                </div>

                {/* Table Content */}
                <div className={`overflow-x-auto ${isScrollable ? 'max-h-[600px] overflow-y-auto custom-scrollbar' : ''}`}>
                    <table className="w-full text-sm text-left">
                        <thead className={`text-[10px] text-gray-500 uppercase font-semibold tracking-wider ${isScrollable ? 'sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm' : 'bg-slate-900/50'}`}>
                            <tr>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                                <th scope="col" className="px-6 py-3">Details</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? (
                                logs.map((log, index) => {
                                    const actionDisplay = getActionDisplay(log.action);
                                    return (
                                        <tr
                                            key={log.id}
                                            className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="px-6 py-3 font-mono text-[10px] text-gray-400">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-7 h-7 rounded-lg ${actionDisplay.bg} flex items-center justify-center`}>
                                                        <actionDisplay.icon className={`w-3.5 h-3.5 ${actionDisplay.color} ${actionDisplay.style || ''}`} />
                                                    </div>
                                                    <span className={`font-medium text-xs ${actionDisplay.color}`}>{actionDisplay.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-300 text-[11px] max-w-md truncate">{log.details}</td>
                                            <td className="px-6 py-3">{getStatusBadge(log.status)}</td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <Icons.Activity className="w-8 h-8 text-gray-600" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No activity recorded yet</p>
                                            <p className="text-gray-600 text-xs">Perform a new extraction to see logs here</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityPage;
