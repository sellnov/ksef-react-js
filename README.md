# @sellnov/ksef-react-js

React wrapper for [sellnov/ksef-js](https://github.com/sellnov/ksef-js). Provides context, hooks and state management for KSeF API integration.

## Installation

```bash
npm install sellnov/ksef-react-js sellnov/ksef-js
```

## Usage

### 1. Setup Provider

Wrap your application (or a part of it) with `KSeFProvider`.

```jsx
import { KSeFProvider } from 'sellnov/ksef-react-js';

const config = {
    test: true, // Use test environment
    nip: '1111111111'
};

function App() {
    return (
        <KSeFProvider config={config}>
            <MyComponent />
        </KSeFProvider>
    );
}
```

### 2. Authentication

Use the `useKSeF` hook to manage authentication state and perform login.

```jsx
import { useKSeF } from 'sellnov/ksef-react-js';

function LoginButton() {
    const { login, isAuthenticated, isLoading, error } = useKSeF();

    const handleLogin = async () => {
        try {
            await login('1111111111', 'YOUR_KSEF_TOKEN');
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    if (isAuthenticated) return <p>Logged in!</p>;

    return (
        <button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login to KSeF'}
        </button>
    );
}
```

### 3. Fetching Invoices

Use `useKSeFInvoices` for reactive invoice listing.

```jsx
import { useKSeFInvoices } from 'sellnov/ksef-react-js';

function InvoiceList() {
    const { invoices, isLoading, error, fetchInvoices } = useKSeFInvoices({
        // Initial filters
        queryCriteria: {
            subjectType: 'subject1',
            type: 'incremental'
        }
    });

    if (isLoading) return <div>Loading invoices...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <button onClick={() => fetchInvoices()}>Refresh</button>
            <ul>
                {invoices.map(inv => (
                    <li key={inv.ksefNumber}>
                        {inv.ksefNumber} - {inv.issuedDate}
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

## API Reference

### `KSeFProvider` Props
- `config`: Configuration object passed to `KSeFClient`.
- `children`: React nodes.

### `useKSeF()`
Returns:
- `client`: The raw `KSeFClient` instance.
- `isAuthenticated`: boolean.
- `session`: Current session metadata.
- `isLoading`: boolean.
- `error`: Last error object.
- `login(nip, token)`: Login function.
- `logout()`: Terminate current session.
- `refreshSession()`: Force refresh session status.

### `useKSeFInvoices(initialFilters, initialParams)`
Returns:
- `invoices`: Array of invoice headers.
- `isLoading`: boolean.
- `error`: Error object.
- `fetchInvoices(filters, params)`: Trigger manual fetch.
- `filters` / `setFilters`: State for query filters.
- `params` / `setParams`: State for query params (e.g. pagination).

## License

MIT
