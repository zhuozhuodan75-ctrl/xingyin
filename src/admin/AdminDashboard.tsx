import { useEffect, useState } from 'react'
import { Users, UserPlus, Clock, CheckCircle2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { fetchDashboardStats, type AdminDashboardStats } from '@/lib/adminApi'
import { AdminPageHeader, AdminCard } from './AdminPageHeader'

function StatCard({
  label, value, icon: Icon, accent, bg,
}: {
  label: string
  value: number
  icon: typeof Users
  accent: string
  bg: string
}) {
  return (
    <AdminCard className="p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-[#888] font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2 tabular-nums">{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg }}
        >
          <Icon size={24} style={{ color: accent }} strokeWidth={1.75} />
        </div>
      </div>
    </AdminCard>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchDashboardStats()
      .then(setStats)
      .catch(err => setError(err instanceof Error ? err.message : '加载失败'))
  }, [])

  if (error) {
    return (
      <AdminCard className="p-10 text-center">
        <p className="text-[#8B2635] text-sm">{error}</p>
        <p className="text-xs text-[#aaa] mt-2">请确认已执行管理员 SQL 并以管理员身份登录</p>
      </AdminCard>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-9 h-9 border-2 border-[#2D5016] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const chartData = stats.registrationTrend.map(d => ({
    ...d,
    label: d.date.slice(5),
  }))

  return (
    <div>
      <AdminPageHeader
        title="数据概览"
        description="平台用户与内容审核概况"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="注册用户总数" value={stats.totalUsers} icon={Users} accent="#2D5016" bg="#2D501612" />
        <StatCard label="今日新注册" value={stats.newUsersToday} icon={UserPlus} accent="#E67E22" bg="#E67E2215" />
        <StatCard label="待审核作品" value={stats.pendingPosts} icon={Clock} accent="#8B2635" bg="#8B263512" />
        <StatCard label="已发布作品" value={stats.publishedPosts} icon={CheckCircle2} accent="#2980B9" bg="#2980B912" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <AdminCard className="xl:col-span-2 p-6">
          <h2 className="text-[15px] font-semibold text-[#333] mb-5">近 14 日注册趋势</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E8EBEF', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value: number) => [`${value} 人`, '新注册']}
                  labelFormatter={label => `${label}`}
                  cursor={{ fill: 'rgba(45,80,22,0.06)' }}
                />
                <Bar dataKey="count" fill="#2D5016" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <h2 className="text-[15px] font-semibold text-[#333] mb-5">本周概况</h2>
          <div className="space-y-1">
            {[
              { label: '近 7 日新用户', value: stats.newUsersWeek, color: '#2D5016' },
              { label: '待审核作品', value: stats.pendingPosts, color: '#E67E22' },
              { label: '已发布作品', value: stats.publishedPosts, color: '#2980B9' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={`flex justify-between items-center py-4 ${i < arr.length - 1 ? 'border-b border-[#F0F2F5]' : ''}`}
              >
                <span className="text-[14px] text-[#666]">{item.label}</span>
                <span className="text-xl font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
