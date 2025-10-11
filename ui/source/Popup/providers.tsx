import * as React from 'react';
import {QueryClientProvider, QueryClient} from 'react-query';

export const Providers = ({children}: {children: React.ReactNode}): React.ReactNode => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};