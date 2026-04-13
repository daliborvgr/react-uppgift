import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

declare global {
  var fetch: typeof fetch;
}

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true, message: 'OK', cars: [] }) });
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App', () => {
  it('renders headings and form tabs', async () => {
    render(<App />);
    expect(await screen.findByText(/Biluthyrning/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bokningsregistrering/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Återlämning/i })).toBeInTheDocument();
  });
});
