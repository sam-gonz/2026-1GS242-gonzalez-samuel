import React from 'react';

type Auth = {
  isLoaded: boolean;
  userId: string | null;
  user: any | null;
  signOut: () => void;
};

const AuthContext = React.createContext<Auth>({ isLoaded: true, userId: null, user: null, signOut: () => {} });

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ isLoaded: true, userId: null, user: null, signOut: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const auth = React.useContext(AuthContext);
  return auth.userId ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const auth = React.useContext(AuthContext);
  return !auth.userId ? <>{children}</> : null;
}

export function UserButton(props: any) {
  return (
    <button {...props} className={props.className} onClick={() => {}}>
      User
    </button>
  );
}

export function SignInButton({ children }: any) {
  // Avoid rendering a nested <button> when callers wrap SignInButton around their own <button>.
  // Render children directly in the shim so the UI markup stays valid.
  return <>{children}</>;
}

export default ClerkProvider;
