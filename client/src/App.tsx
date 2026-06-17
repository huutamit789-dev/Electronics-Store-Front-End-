// App.tsx
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
   <div className="app h-full w-full bg-gray-100 dark:bg-gray-900">
      <AppRoutes />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;