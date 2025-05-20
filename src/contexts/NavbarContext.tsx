
import { createContext, useContext, ReactNode, useState } from 'react';

interface NavbarContextType {
  streak: number;
  setStreak?: (value: number) => void;
}

export const NavbarContext = createContext<NavbarContextType>({ streak: 0 });

export const useNavbarContext = () => useContext(NavbarContext);

export const NavbarProvider = ({ children, initialStreak = 0 }: { children: ReactNode, initialStreak?: number }) => {
  const [streak, setStreak] = useState(initialStreak);
  
  return (
    <NavbarContext.Provider value={{ streak, setStreak }}>
      {children}
    </NavbarContext.Provider>
  );
};
