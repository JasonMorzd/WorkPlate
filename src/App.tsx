import { useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import Header from '@/components/Header';
import TaskGrid from '@/components/TaskGrid';
import FrostedOverlay from '@/components/FrostedOverlay';

export default function App() {
  const initializeDemoData = useTaskStore((s) => s.initializeDemoData);

  useEffect(() => {
    initializeDemoData();
  }, [initializeDemoData]);

  return (
    <div className="w-full h-full flex flex-col bg-canvas">
      <Header />
      <TaskGrid />
      <FrostedOverlay />
    </div>
  );
}
