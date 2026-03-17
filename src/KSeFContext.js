import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useContext,
    createElement,
} from 'react';
import { KSeFClient } from '@sellnov/ksef-js';

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

    const [client, setClient] = useState(() => new KSeFClient(config));

    useEffect(() => {
        setClient(new KSeFClient(config));
    }, [config?.baseUrl, config?.test, config?.token]);

    const updateSessionStatus = useCallback(async (clientToCheck = client) => {
        try {
            const status = await clientToCheck.sessionStatus();
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
                let certBase64 = config?.ksefTokenEncryptionCertificate;
                if (!certBase64) {
                    const baseUrl = config?.publicKeyCertificatesUrl ?? config?.baseUrl;
                    if (baseUrl) {
                        const url = baseUrl.endsWith("/")
                            ? `${baseUrl}security/public-key-certificates`
                            : `${baseUrl}/security/public-key-certificates`;
                        const resp = await fetch(url);
                        if (resp.ok) {
                            const keys = await resp.json();
                            const found = Array.isArray(keys)
                                ? keys.find(k => Array.isArray(k?.usage) && k.usage.includes("KsefTokenEncryption"))
                                : null;
                            certBase64 = found?.certificate ?? null;
                        }
                    }
                }

                const configuredClient = new KSeFClient({
                    ...config,
                    nip,
                    ksefToken: token,
                    ...(certBase64 ? { ksefTokenEncryptionCertificate: certBase64 } : {}),
                });
                setClient(configuredClient);

                const result = await configuredClient.login();
                await updateSessionStatus(configuredClient);
                return result;
            } catch (err) {
                setError(err);
                setIsAuthenticated(false);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [config, updateSessionStatus],
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
        if (config?.token) {
            updateSessionStatus();
            return;
        }
        setIsLoading(false);
    }, [config?.token, updateSessionStatus]);

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

    return createElement(KSeFContext.Provider, { value }, children);
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
