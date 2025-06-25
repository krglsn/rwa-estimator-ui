import { createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';

type TokenContextType = {
  selectedTokenId: number;
  setSelectedTokenId: (tokenId: number) => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: preact.ComponentChildren }) => {
  const [selectedTokenId, setSelectedTokenId] = useState<number>(0);

  return (
    <TokenContext.Provider
      value={{
        selectedTokenId,
        setSelectedTokenId,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};