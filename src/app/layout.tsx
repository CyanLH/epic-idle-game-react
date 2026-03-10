import type { Metadata } from 'next';
import '../index.css';
import '../App.css';
import { Providers } from '../components/Providers';

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
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
