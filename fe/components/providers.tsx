'use client';
import React from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PropsWithChildren } from 'react';
import { Network } from '@aptos-labs/ts-sdk';
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <AptosWalletAdapterProvider
      optInWallets={['Petra']}
      autoConnect={true}
      dappConfig={{ network: Network.DEVNET }}
      onError={error => {
        console.log('error', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default Providers;
