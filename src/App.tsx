import { Suspense, lazy, type ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const HomePage = lazy(() => import('@/pages/HomePage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const VehiclePage = lazy(() => import('@/pages/VehiclePage'));
const DiagramPage = lazy(() => import('@/pages/DiagramPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function RootLayout(): ReactElement {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<div className="container mx-auto px-4 py-12 text-slate-500">Loading…</div>}>
        <Outlet />
      </Suspense>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'c/:slug', element: <CategoryPage /> },
      { path: 'v/:makeSlug/:modelSlug/:year', element: <VehiclePage /> },
      { path: 'd/:slug', element: <DiagramPage /> },
    ],
  },
]);

export function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
