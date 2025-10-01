import React from 'react';
import SocialButton from '@components/UI/SocialButton';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import { signIn } from 'next-auth/react';

interface AuthSocialLoginProps {
  role?: 'USER' | 'BRAND' | null;
}

const AuthSocialLogin: React.FC<AuthSocialLoginProps> = ({ role = null }) => {
  const handleGoogleSignIn = () => {
    if (role) {
      document.cookie = `signupRole=${role}; path=/`;
    } else {
      document.cookie = 'signupRole=; path=/; Max-Age=0';
    }
    signIn('google');
  };

  const handleFacebookSignIn = () => {
    if (role) {
      document.cookie = `signupRole=${role}; path=/`;
    } else {
      document.cookie = 'signupRole=; path=/; Max-Age=0';
    }
    signIn('facebook');
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={handleGoogleSignIn}
      >
        Continue with Google
      </SocialButton>
      <SocialButton
        icon={<FacebookIcon className="h-5 w-5" />}
        provider="Facebook"
        onClick={handleFacebookSignIn}
      >
        Continue with Facebook
      </SocialButton>
    </div>
  );
};

export default AuthSocialLogin;
