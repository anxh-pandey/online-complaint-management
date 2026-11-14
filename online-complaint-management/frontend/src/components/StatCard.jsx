const COLORS = {
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ icon: Icon, label, value, color = 'blue', loading }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${COLORS[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-12 rounded bg-slate-100" />
        ) : (
          <p className="text-2xl font-semibold text-slate-900">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}
