import { useState, useCallback, useEffect } from 'react';
import { useKSeF } from './KSeFContext.js';

/**
 * Hook for downloading a single KSeF invoice content (XML).
 *
 * @param {string} [ksefNumber] - KSeF reference number to fetch immediately
 * @returns {object} { invoice, isLoading, error, downloadInvoice }
 */
export function useKSeFInvoice(ksefNumber = null) {
    const { client, isAuthenticated } = useKSeF();
    const [invoice, setInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const downloadInvoice = useCallback(
        async (num = ksefNumber) => {
            if (!isAuthenticated || !num) return;

            setIsLoading(true);
            setError(null);
            try {
                const result = await client.invoices.download(num);
                setInvoice(result);
                return result;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [client, isAuthenticated, ksefNumber],
    );

    useEffect(() => {
        if (ksefNumber && isAuthenticated) {
            downloadInvoice(ksefNumber);
        }
    }, [ksefNumber, isAuthenticated, downloadInvoice]);

    return {
        invoice,
        isLoading,
        error,
        downloadInvoice,
    };
}
