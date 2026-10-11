import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { lazy, Suspense } from "react";
import { Toaster } from "sonner";

// pages
const Tickets = lazy(() => import("./pages/tickets/tickets"));

export default function App({ queryClient }) {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <Tickets queryClient={queryClient} />
        </Suspense>
      ),
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}
