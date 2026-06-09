import { Suspense, lazy, type ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireSeller } from '@/components/auth/RequireSeller';
import { RequireAdmin } from '@/components/auth/RequireAdmin';

const HomePage = lazy(() => import('@/pages/HomePage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const VehiclePage = lazy(() => import('@/pages/VehiclePage'));
const DiagramPage = lazy(() => import('@/pages/DiagramPage'));
const PartPage = lazy(() => import('@/pages/PartPage'));
const ListingPage = lazy(() => import('@/pages/ListingPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SellerOnboardingPage = lazy(() => import('@/pages/SellerOnboardingPage'));
const SellerDashboardPage = lazy(() => import('@/pages/SellerDashboardPage'));
const ListingEditorPage = lazy(() => import('@/pages/ListingEditorPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const CategoryListPage = lazy(() => import('@/pages/CategoryListPage'));
const CategoryEditorPage = lazy(() => import('@/pages/CategoryEditorPage'));
const PartListPage = lazy(() => import('@/pages/PartListPage'));
const PartEditorPage = lazy(() => import('@/pages/PartEditorPage'));
const DiagramListPage = lazy(() => import('@/pages/DiagramListPage'));
const DiagramEditorPage = lazy(() => import('@/pages/DiagramEditorPage'));

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
      { path: 'p/:partId', element: <PartPage /> },
      { path: 'listings/:listingId', element: <ListingPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'sell/onboarding',
        element: (
          <RequireAuth>
            <SellerOnboardingPage />
          </RequireAuth>
        ),
      },
      {
        path: 'sell',
        element: (
          <RequireSeller>
            <SellerDashboardPage />
          </RequireSeller>
        ),
      },
      {
        path: 'sell/listings/new',
        element: (
          <RequireSeller>
            <ListingEditorPage mode="create" />
          </RequireSeller>
        ),
      },
      {
        path: 'sell/listings/:listingId',
        element: (
          <RequireSeller>
            <ListingEditorPage mode="edit" />
          </RequireSeller>
        ),
      },
      {
        path: 'admin',
        element: (
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/categories',
        element: (
          <RequireAdmin>
            <CategoryListPage />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/categories/new',
        element: (
          <RequireAdmin>
            <CategoryEditorPage mode="create" />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/categories/:id',
        element: (
          <RequireAdmin>
            <CategoryEditorPage mode="edit" />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/parts',
        element: (
          <RequireAdmin>
            <PartListPage />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/parts/new',
        element: (
          <RequireAdmin>
            <PartEditorPage mode="create" />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/parts/:id',
        element: (
          <RequireAdmin>
            <PartEditorPage mode="edit" />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/diagrams',
        element: (
          <RequireAdmin>
            <DiagramListPage />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/diagrams/new',
        element: (
          <RequireAdmin>
            <DiagramEditorPage mode="create" />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/diagrams/:id',
        element: (
          <RequireAdmin>
            <DiagramEditorPage mode="edit" />
          </RequireAdmin>
        ),
      },
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
