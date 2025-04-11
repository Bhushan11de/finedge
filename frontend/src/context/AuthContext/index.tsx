import { createContext, useContext, ReactNode } from 'react';

type AuthContextType = {
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);

  const signIn = async (email: string, password: string) => {
    // Firebase auth implementation
  };

  const signOut = async () => {
    // Sign out logic
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
