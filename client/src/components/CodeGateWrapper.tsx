import React from 'react';
import { useCodeGateStore } from '@/store/codeGateStore';
import { CodeGatePage } from '@/pages/CodeGatePage';

interface CodeGateWrapperProps {
  children: React.ReactNode;
}

export const CodeGateWrapper: React.FC<CodeGateWrapperProps> = ({ children }) => {
  const isCodeEntered = useCodeGateStore((state) => state.isCodeEntered);

  if (!isCodeEntered) {
    return <CodeGatePage />;
  }

  return <>{children}</>;
};
