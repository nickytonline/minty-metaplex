import Link from 'next/link';

interface InstallPhantomWalletProps {
  isMobile: boolean;
}

export const InstallPhantomWallet: React.FC<InstallPhantomWalletProps> = ({
  isMobile,
}) => {
  if (isMobile) {
    return (
      <p>
        <Link href="https://phantom.app/" passHref>
          <a target="_blank" rel="noopener">
            Phantom Wallet
          </a>
        </Link>{' '}
        does not support mobile devices.
      </p>
    );
  }

  return (
    <p>
      Phantom wallet is not installed.{' '}
      <Link href="https://phantom.app/" passHref>
        <a target="_blank" rel="noopener">
          Install Phantom wallet
        </a>
      </Link>
      .
    </p>
  );
};
