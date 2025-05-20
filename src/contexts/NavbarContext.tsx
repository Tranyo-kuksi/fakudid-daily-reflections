
import { createContext, useContext } from 'react';

interface NavbarContextType {
  streak: number;
}

export const NavbarContext = createContext<NavbarContextType>({ streak: 0 });

export const useNavbarContext = () => useContext(NavbarContext);
