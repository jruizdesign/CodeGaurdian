import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
    it('renders the header', () => {
        render(<App />);
        expect(screen.getByText(/Code Snippet/i)).toBeInTheDocument();
        expect(screen.getByText(/Website URL/i)).toBeInTheDocument();
    });
});
