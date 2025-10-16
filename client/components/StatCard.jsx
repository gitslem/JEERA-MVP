'use client';

export default function StatCard({ title, value, icon, color }) {
  const IconComponent = icon;
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
      <div className={`rounded-full p-3 ${color.bg}`}>
        <IconComponent className={`h-6 w-6 ${color.text}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}