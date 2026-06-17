// App.tsx
import { AppRoutes } from '@/routes/AppRoutes';
import { MainLayout } from '@/components/layout/MainLayout';

function App() {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}

export default App;