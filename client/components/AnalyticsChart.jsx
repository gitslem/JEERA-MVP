'use client';

const barColors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-gray-500'];

export default function AnalyticsChart({ title, data }) {
  const dataEntries = Object.entries(data);
  const maxValue = Math.max(...dataEntries.map(([, value]) => value));

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {dataEntries.map(([key, value], index) => (
          <div key={key} className="flex items-center">
            <span className="w-24 text-sm text-gray-600 capitalize">{key.replace('-', ' ')}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6">
              <div
                className={`h-6 rounded-full ${barColors[index % barColors.length]} flex items-center justify-end pr-2`}
                style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
              >
                <span className="text-xs font-bold text-white">{value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}