import { Layout } from 'antd';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout.Content style={{ padding: '20px' }}>
        {children}
      </Layout.Content>
      <Footer />
    </Layout>
  );
};