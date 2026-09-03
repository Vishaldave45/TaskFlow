import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DbClient, DbProvider } from '@tanstack/react-db'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import theme from '@/theme'
import App from '@/App'
import './index.css'

/**
 * Create the TanStack DB client and register the shared QueryClient
 * as a named dependency so `queryCollectionOptions` can retrieve it
 * via `client.requireDependency<QueryClient>('queryClient')`.
 */
const dbClient = new DbClient({ queryClient })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DbProvider client={dbClient}>
        <ChakraProvider theme={theme}>
          <BrowserRouter>
            <AuthProvider>
              <App />
              <ReactQueryDevtools initialIsOpen={false} />
            </AuthProvider>
          </BrowserRouter>
        </ChakraProvider>
      </DbProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
