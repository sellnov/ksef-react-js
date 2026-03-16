import { useState, useCallback, useEffect } from 'react';
import { useKSeF } from './KSeFContext.js';

/**
 * Hook for managing KSeF invoices with React state.
 *
 * @param {object} [initialFilters] - Initial query filters
 * @param {object} [initialParams] - Initial query parameters (pagination, etc)
 * @returns {object} { invoices, isLoading, error, fetchInvoices, filters, setFilters, params, setParams }
 */
export function useKSeFInvoices(initialFilters = {}, initialParams = {}) {
    const { client, isAuthenticated } = useKSeF();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [params, setParams] = useState(initialParams);

    const fetchInvoices = useCallback(
        async (f = filters, p = params) => {
            if (!isAuthenticated) return;

            setIsLoading(true);
            setError(null);
            try {
                const result = await client.invoices.queryMetadata(f, p);
                setInvoices(result.invoiceHeaders || []);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        },
        [client, isAuthenticated, filters, params],
    );

    const downloadInvoice = useCallback(
        async (ksefNumber) => {
            if (!isAuthenticated || !ksefNumber) return;
            return await client.invoices.download(ksefNumber);
        },
        [client, isAuthenticated],
    );

    useEffect(() => {
        if (isAuthenticated) {
            fetchInvoices();
        }
    }, [isAuthenticated, fetchInvoices]);

    return {
        invoices,
        isLoading,
        error,
        fetchInvoices,
        downloadInvoice,
        filters,
        setFilters,
        params,
        setParams,
    };
}
