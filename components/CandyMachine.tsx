// TODO: Fix types and handle exclamation typing
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { MintLayout, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { programs, Wallet } from '@metaplex/js';
import {
  candyMachineProgram,
  TOKEN_METADATA_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
} from '../helpers';
import { Minter } from '@components/Minter';
import { Mints } from '@components/Mints';
import { toast } from 'react-toastify';

const {
  metadata: { Metadata, MetadataProgram },
} = programs;

const config = new web3.PublicKey(
  process.env.NEXT_PUBLIC_REACT_APP_CANDY_MACHINE_CONFIG!,
);
const { SystemProgram } = web3;
const opts = {
  preflightCommitment: 'processed',
};

const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;
const MAX_CREATOR_LEN = 32 + 1 + 1;

export const CandyMachine: React.FC<{
  walletAddress: Wallet;
}> = ({ walletAddress }) => {
  const [machineStats, setMachineStats] = useState<any>(null);
  const [mints, setMints] = useState<any>([]);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [loadingMints, setLoadingMints] = useState<boolean>(true);

  useEffect(() => {
    // Declare getCandyMachineState as an async method
    async function getCandyMachineState() {
      const provider = getProvider();

      // Get metadata about your deployed candy machine program
      const idl = await Program.fetchIdl(candyMachineProgram, provider);

      // Create a program that you can call
      const program = new Program(idl!, candyMachineProgram, provider);

      // Fetch the metadata from your candy machine
      const candyMachine = await program.account.candyMachine.fetch(
        process.env.NEXT_PUBLIC_REACT_APP_CANDY_MACHINE_ID!,
      );

      // Parse out all our metadata and log it out
      const itemsAvailable = candyMachine.data.itemsAvailable.toNumber();
      const itemsRedeemed = candyMachine.itemsRedeemed.toNumber();
      const itemsRemaining = itemsAvailable - itemsRedeemed;
      const goLiveData = candyMachine.data.goLiveDate.toNumber();

      // We will be using this later in our UI so let's generate this now
      const goLiveDateTimeString = `${new Date(
        goLiveData * 1000,
      ).toUTCString()}`;

      setMachineStats({
        itemsAvailable,
        itemsRedeemed,
        itemsRemaining,
        goLiveData,
        goLiveDateTimeString,
      });

      console.log({
        itemsAvailable,
        itemsRedeemed,
        itemsRemaining,
        goLiveData,
        goLiveDateTimeString,
      });

      const data = await fetchHashTable(
        process.env.NEXT_PUBLIC_REACT_APP_CANDY_MACHINE_ID!,
        true,
      );

      if (data.length !== 0) {
        let receivedMints = mints.slice();
        let newMints = false;

        setLoadingMints(true);

        for (const mint of data) {
          if (typeof mint === 'string') {
            continue;
          }

          // Get URI
          const response = await fetch(mint.data.uri);
          const parse = await response.json();
          console.log('Past Minted NFT', mint);

          // Get image URI
          if (!mints.includes(parse.image)) {
            newMints = true;
            receivedMints.push(parse.image);
          }
        }

        if (newMints) {
          setMints(receivedMints);
        }

        setLoadingMints(false);
      }
    }
    getCandyMachineState();
  }, [mints]);

  const getProvider = () => {
    const rpcHost = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST!;
    // Create a new connection object
    const connection = new Connection(rpcHost);

    // Create a new Solana provider object
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment as any,
    );

    return provider;
  };

  // Actions
  const fetchHashTable = async (hash: string, metadataEnabled: boolean) => {
    const connection = new web3.Connection(
      process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST!,
    );

    const metadataAccounts = await MetadataProgram.getProgramAccounts(
      connection,
      {
        filters: [
          {
            memcmp: {
              offset:
                1 +
                32 +
                32 +
                4 +
                MAX_NAME_LENGTH +
                4 +
                MAX_URI_LENGTH +
                4 +
                MAX_SYMBOL_LENGTH +
                2 +
                1 +
                4 +
                0 * MAX_CREATOR_LEN,
              bytes: hash,
            },
          },
        ],
      },
    );

    const mintHashes = [];

    for (let index = 0; index < metadataAccounts.length; index++) {
      const account = metadataAccounts[index];
      const accountInfo = await connection.getParsedAccountInfo(account.pubkey);
      const metadata = new Metadata(
        hash.toString(),
        accountInfo.value as web3.AccountInfo<Buffer>,
      );
      if (metadataEnabled) mintHashes.push(metadata.data);
      else mintHashes.push(metadata.data.mint);
    }

    return mintHashes;
  };

  const getMetadata = async (mint: PublicKey) => {
    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  };

  const getMasterEdition = async (mint: PublicKey) => {
    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  };

  const getTokenWallet = async (wallet: PublicKey, mint: PublicKey) => {
    const [tokenWallet] = await web3.PublicKey.findProgramAddress(
      [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    );

    return tokenWallet;
  };

  const mintToken = async () => {
    if (isMinting) {
      toast.error('Only one minting at a time is allowed');
      return;
    }

    setIsMinting(true);

    let toastId;

    try {
      const mint = web3.Keypair.generate();
      const token = await getTokenWallet(
        walletAddress.publicKey,
        mint.publicKey,
      );
      const metadata = await getMetadata(mint.publicKey);
      const masterEdition = await getMasterEdition(mint.publicKey);
      const rpcHost = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST!;
      const connection = new Connection(rpcHost);
      const rent = await connection.getMinimumBalanceForRentExemption(
        MintLayout.span,
      );

      const accounts = {
        config,
        candyMachine: process.env.NEXT_PUBLIC_REACT_APP_CANDY_MACHINE_ID,
        payer: walletAddress.publicKey.toString(),
        wallet: process.env.NEXT_PUBLIC_REACT_APP_TREASURY_ADDRESS,
        mint: mint.publicKey.toString(),
        metadata,
        masterEdition,
        mintAuthority: walletAddress.publicKey.toString(),
        updateAuthority: walletAddress.publicKey.toString(),
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
      };

      const signers = [mint];
      const instructions = [
        web3.SystemProgram.createAccount({
          fromPubkey: walletAddress.publicKey,
          newAccountPubkey: mint.publicKey,
          space: MintLayout.span,
          lamports: rent,
          programId: TOKEN_PROGRAM_ID,
        }),
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          0,
          walletAddress.publicKey,
          walletAddress.publicKey,
        ),
        createAssociatedTokenAccountInstruction(
          token,
          walletAddress.publicKey,
          walletAddress.publicKey,
          mint.publicKey,
        ),
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          token,
          walletAddress.publicKey,
          [],
          1,
        ),
      ];

      const provider = getProvider();
      const idl = await Program.fetchIdl(candyMachineProgram, provider);
      const program = new Program(idl!, candyMachineProgram, provider);

      toastId = program.programId.toString();

      toast.info('Minting...', { toastId });

      const txn = await program.rpc.mintNft({
        accounts,
        signers,
        instructions,
      } as any);

      console.log('txn:', txn);

      // Setup listener
      connection.onSignatureWithOptions(
        txn,
        async (notification, context) => {
          if (notification.type === 'status') {
            console.log('Receievd status event');

            const { result } = notification;
            if (!result.err) {
              console.log('NFT Minted!');
            }
          }
        },
        { commitment: 'processed' },
      );

      toast.info('Minted!');
    } catch (error: any) {
      let message = error.msg ? error.msg : 'Minting failed! Please try again!';

      if (!error.msg) {
        if (error.message.indexOf('0x138')) {
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      toast.error(message);

      console.error(error.message);
    } finally {
      toastId && toast.dismiss(toastId);
      setIsMinting(false);
    }
  };

  const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey,
  ) => {
    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
      { pubkey: walletAddress, isSigner: false, isWritable: false },
      { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      {
        pubkey: web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new web3.TransactionInstruction({
      keys,
      programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      data: Buffer.from([]),
    });
  };

  const isSoldOut =
    machineStats && machineStats.itemsRedeemed === machineStats.itemsAvailable;

  return (
    machineStats && (
      <div
        className="machine-container"
        sx={{ display: 'grid', placeItems: 'center', '* + *': { mt: 2 } }}
      >
        <p>{`Drop Date: ${machineStats.goLiveDateTimeString}`}</p>
        <p>{`Items Minted: ${machineStats.itemsRedeemed} / ${machineStats.itemsAvailable}`}</p>
        <Minter onMint={mintToken} isSoldOut={isSoldOut} />
        {loadingMints ? (
          <div sx={{ margin: '1rem' }}>Loading mints...</div>
        ) : (
          <Mints mints={mints} />
        )}
      </div>
    )
  );
};
