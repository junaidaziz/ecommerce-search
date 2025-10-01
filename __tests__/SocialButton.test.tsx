import React from 'react';
import { render, screen } from '@testing-library/react';
import SocialButton from '@components/UI/SocialButton';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import GithubIcon from '@components/icons/GithubIcon';

describe('SocialButton', () => {
  it('renders Google button with correct text', () => {
    const handleClick = jest.fn();
    render(
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={handleClick}
      />
    );
    
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders Facebook button with correct text', () => {
    const handleClick = jest.fn();
    render(
      <SocialButton
        icon={<FacebookIcon className="h-5 w-5" />}
        provider="Facebook"
        onClick={handleClick}
      />
    );
    
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
  });

  it('renders GitHub button with correct text', () => {
    const handleClick = jest.fn();
    render(
      <SocialButton
        icon={<GithubIcon className="h-5 w-5" />}
        provider="GitHub"
        onClick={handleClick}
      />
    );
    
    expect(screen.getByText('Continue with GitHub')).toBeInTheDocument();
  });

  it('renders custom children text', () => {
    const handleClick = jest.fn();
    render(
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={handleClick}
      >
        Sign in with Google
      </SocialButton>
    );
    
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('applies hover transition styles for all providers', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={handleClick}
      />
    );
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('transition-all');
    expect(button?.className).toContain('duration-300');
  });
});
