import React, { createContext, useContext, useMemo, useState } from "react";

export type FileStoreValue = {
  file: File | null;
  setFile: (file: File | null) => void;
};

const FileStoreContext = createContext<FileStoreValue | null>(null);

export const FileStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const value = useMemo(() => ({ file, setFile }), [file]);

  return (
    <FileStoreContext.Provider value={value}>
      {children}
    </FileStoreContext.Provider>
  );
};

export const useFileStore = () => {
  const context = useContext(FileStoreContext);
  if (!context) {
    throw new Error("useFileStore must be used within FileStoreProvider");
  }
  return context;
};
