import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime         : 5 * 60 * 1000,  // 5 minutes
      gcTime            : 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      retry             : 1,
      refetchOnWindowFocus: false,        // avoids extra fetches on tab switch
    },
    mutations: {
      retry: 0, // never auto-retry failed mutations
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background : '#fff',
            color      : '#191c1e',
            border     : '1px solid #d0c5af',
            fontFamily : 'Inter, sans-serif',
            fontSize   : '14px',
          },
          success: { iconTheme: { primary: '#735c00', secondary: '#fff' } },
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
