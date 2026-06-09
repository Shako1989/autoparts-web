import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Package, ImagePlus, ChevronRight } from 'lucide-react';

const SECTIONS = [
  {
    to: '/admin/categories',
    title: 'Categories',
    description: 'Manage the catalog tree: create, rename, reorder, and delete.',
    icon: FolderTree,
  },
  {
    to: '/admin/parts',
    title: 'Parts',
    description: 'Add parts, edit specs in three locales, manage OEM/aftermarket numbers and fitments.',
    icon: Package,
  },
  {
    to: '/admin/diagrams',
    title: 'Diagrams',
    description: 'Upload exploded-view images and place numbered callouts that link to parts.',
    icon: ImagePlus,
  },
];

export default function AdminDashboardPage(): ReactElement {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-slate-500">Catalog management for staff users.</p>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <li key={s.to}>
            <Link
              to={s.to}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
            >
              <s.icon className="h-6 w-6 flex-none text-slate-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900">{s.title}</div>
                <div className="mt-1 text-xs text-slate-500">{s.description}</div>
              </div>
              <ChevronRight className="h-4 w-4 flex-none text-slate-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
