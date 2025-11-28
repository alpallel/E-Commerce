import { createContext, useContext, useState } from "react";

const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
  // Use an array of ids for simplicity
  const [selectedIds, setSelectedIds] = useState([]);

  const addSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeSelected = (id) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelected = () => setSelectedIds([]);

  const isSelected = (id) => selectedIds.includes(id);

  const getCount = () => selectedIds.length;

  return (
    <SelectionContext.Provider
      value={{
        selectedIds,
        addSelected,
        removeSelected,
        toggleSelected,
        clearSelected,
        isSelected,
        getCount,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const ctx = useContext(SelectionContext);
  if (!ctx)
    throw new Error("useSelection must be used within a SelectionProvider");
  return ctx;
};
