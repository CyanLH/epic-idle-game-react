import type { Metadata } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import '../index.css';

const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka' });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-nunito' });
import { Providers } from '../components/Providers';
import ConvexClientProvider from '../components/ConvexClientProvider';

export const metadata: Metadata = {
  title: '아이돌 키우기 - 방치형 게임',
  description: '최고의 아이돌을 키워보세요!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="font-nunito bg-gradient-to-br from-pink-50 to-pink-100 min-h-screen text-gray-800 antialiased overflow-hidden selection:bg-pink-300 selection:text-white">
        <ConvexClientProvider>
          <Providers>{children}</Providers>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
