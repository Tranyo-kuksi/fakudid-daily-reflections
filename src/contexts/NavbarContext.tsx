
import { createContext, useContext, useState } from 'react';

interface NavbarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  streak: number;
}

// Create context with default values
export const NavbarContext = createContext<NavbarContextType>({ 
  isOpen: false,
  setIsOpen: () => {},
  streak: 0 
});

// Create a provider component
export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  return (
    <NavbarContext.Provider value={{ isOpen, setIsOpen, streak }}>
      {children}
    </NavbarContext.Provider>
  );
};

// Export the hook for using the context
export const useNavbar = () => useContext(NavbarContext);
