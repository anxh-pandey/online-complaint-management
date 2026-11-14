import { CheckCircle2, ClipboardList } from 'lucide-react';

const points = [
  'Submit complaints in under a minute',
  'Track every status change in real time',
  'Get clear remarks from the administration',
];

// Two-column layout shared by the login and registration pages
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 to-blue-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <ClipboardList className="h-6 w-6" />
          </span>
          <span className="text-xl font-semibold">ComplaintDesk</span>
        </div>

        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            A simple way to raise campus issues and see them resolved.
          </h1>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-blue-100">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-300" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-blue-200">Online Complaint Management System</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ClipboardList className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-slate-900">ComplaintDesk</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
