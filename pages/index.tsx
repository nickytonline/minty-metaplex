import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoadingIndicator } from '@components/LoadingIndicator';
import { InstallPhantomWallet } from '@components/InstallPhantomWallet';
import { Wallet } from '@components/Wallet';
import { Connection } from '@solana/web3.js';
import { Program, Provider } from '@project-serum/anchor';
import { CandyMachine } from '@components/CandyMachine';
type SolanaProvider = typeof window.solana;

function isMobile() {
  return /mobile|ipad|iphone|ios/i.test(navigator.userAgent.toLowerCase());
}

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();

  function stopLoading() {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }

  useEffect(() => {
    async function checkIfWalletIsConnected(solana: SolanaProvider) {
      try {
        solana.connect(); // { onlyIfTrusted: true }
      } catch (error) {
        console.dir(error);
        toast.error('An unknown error occurred connecting your account.');
      } finally {
        stopLoading();
      }
    }

    function phantomWalletCheck() {
      const { solana } = window;

      if (!solana?.isPhantom) {
        stopLoading();
        toast.error(<InstallPhantomWallet isMobile={isMobile()} />, {
          autoClose: false,
        });
        return;
      }

      checkIfWalletIsConnected(solana);

      solana.on('connect', async (publicKey: { toString: () => string }) => {
        console.log('Connected with Public Key:', publicKey.toString());

        try {
          setWalletAddress(publicKey.toString());
          toast.info(
            <p>
              Connected with wallet address:{' '}
              <span sx={{ wordBreak: 'break-word' }}>
                {publicKey.toString()}
              </span>
            </p>,
          );
        } catch (error) {
          console.error(error);
          toast.error('An error occurred connecting your account.');
        }
      });
    }

    window.addEventListener('load', phantomWalletCheck);
    document.querySelector('.Toastify')?.setAttribute('aria-live', 'polite');

    return () => {
      window.removeEventListener('load', phantomWalletCheck);
    };
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <Head>
        <title>Minty Metaplex</title>
        <meta name="description" content="Welcome to Minty Metaplex!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header sx={{ margin: '1rem 0', display: 'grid', placeItems: 'center' }}>
        <h1
          sx={{
            fontFamily: 'heading',
            background: 'linear-gradient(to left,#c300ff 0%, #fff 100%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Minty Metaplex
        </h1>
        <p>🍭&nbsp;&nbsp;Candy Drop</p>
        <p>NFT drop machine with fair mint</p>
      </header>
      <main
        sx={{
          display: 'grid',
          gap: '1rem',
          width: [null, null, '50vw', '90vw'],
        }}
      >
        <ToastContainer />
        <Wallet
          walletAddress={walletAddress}
          connectWallet={() => {
            window.solana.connect();
          }}
        />
        {walletAddress && <CandyMachine walletAddress={window.solana} />}
      </main>
      <footer>
        <nav>
          <ul
            sx={{
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              placeItems: 'center',
              margin: 0,
              marginTop: '1rem',
              padding: 0,
              gridGap: '1rem',
            }}
          >
            <li>
              <a href="https://github.com/nickytonline/minty-metaplex">
                source code
              </a>
            </li>
            <li>
              <a href="https://timeline.iamdeveloper.com">about Nick</a>
            </li>
            <li>
              <a href="https://twitter.com/_buildspace">
                Built on Buildspace 🦄
              </a>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
};

export default Home;
