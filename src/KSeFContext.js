import { createContext, useMemo, useState, useEffect, useCallback, useContext } from 'react';
import { KSeFClient } from 'sellnov/ksef-js';

const KSeFContext = createContext(null);

/**
 * Provider component for KSeF Client.
 *
 * @param {object} props
 * @param {object} [props.config] - KSeFClient configuration
 * @param {import('react').ReactNode} props.children
 */
export function KSeFProvider({ config = {}, children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize the client instance to avoid recreation on every render
    const client = useMemo(() => new KSeFClient(config), [config]);

    const updateSessionStatus = useCallback(async () => {
        try {
            const status = await client.sessionStatus();
            setSession(status);
            setIsAuthenticated(!!status);
        } catch (err) {
            setError(err);
            setSession(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, [client]);

    const login = useCallback(
        async (nip, token) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await client.login(nip, token);
                await updateSessionStatus();
                return result;
            } catch (err) {
                setError(err);
                setIsAuthenticated(false);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [client, updateSessionStatus],
    );

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await client.sessions.terminateCurrent();
            setIsAuthenticated(false);
            setSession(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [client]);

    useEffect(() => {
        updateSessionStatus();
    }, [updateSessionStatus]);

    const value = {
        client,
        isAuthenticated,
        session,
        isLoading,
        error,
        login,
        logout,
        refreshSession: updateSessionStatus,
    };

    return <KSeFContext.Provider value={value}>{children}</KSeFContext.Provider>;
}

/**
 * Custom hook to use KSeF context.
 */
export function useKSeF() {
    const context = useContext(KSeFContext);
    if (!context) {
        throw new Error('useKSeF must be used within a KSeFProvider');
    }
    return context;
}

export default KSeFContext;
