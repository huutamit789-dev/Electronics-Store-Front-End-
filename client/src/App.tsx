// App.tsx
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { CodeGateWrapper } from '@/components/CodeGateWrapper'; // Import CodeGateWrapper

function App() {
  return (
   <div className="app h-full w-full bg-gray-100 dark:bg-gray-900">
      <CodeGateWrapper> {/* Wrap AppRoutes with CodeGateWrapper */}
        <AppRoutes />
      </CodeGateWrapper>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;