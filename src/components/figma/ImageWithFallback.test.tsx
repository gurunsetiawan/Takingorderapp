import { fireEvent, render, screen } from '@testing-library/react';
import { ImageWithFallback } from './ImageWithFallback';
import { describe, expect, it } from 'vitest';

describe('ImageWithFallback', () => {
  it('renders fallback image after error', () => {
    render(<ImageWithFallback src="https://example.com/missing.png" alt="test" />);

    const img = screen.getByAltText('test');
    fireEvent.error(img);

    expect(screen.getByAltText('Error loading image')).toBeInTheDocument();
  });
});
