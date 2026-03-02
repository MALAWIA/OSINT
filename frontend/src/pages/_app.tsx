import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { StockTrackingProvider } from '@/contexts/StockTrackingContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <StockTrackingProvider>
          <Component {...pageProps} />
        </StockTrackingProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
