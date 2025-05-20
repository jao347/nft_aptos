'use client';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import ConnectWalletButton from '../helpers/Aptos/ConnectWalletButton';
import QuantityToggle from '../helpers/QuantityToggle';
import {
  collectionCoverUrl,
  collectionBackgroundUrl,
  MaxMint,
  NODE_URL,
  CONTRACT_ADDRESS,
  COLLECTION_SIZE,
} from '../helpers/candyMachineInfo';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NETWORK_STR = Network.DEVNET;
const config = new AptosConfig({ network: NETWORK_STR });
const aptosClient = new Aptos(config);

export default function Home() {
  const { account, connect, connected, wallet, signAndSubmitTransaction } = useWallet();

  const [quantity, setQuantity] = useState<number>(1);
  const [minting, setMinting] = useState<boolean>(false);
  const [currentSupply, setCurrentSupply] = useState<number | undefined>();
  const [maxSupply, setMaxSupply] = useState<number | undefined>();
  const [mintFee, setMintFee] = useState<number | undefined>();
  const [collectionName, setCollectionName] = useState<string | undefined>();
  const [notificationActive, setNotificationActive] = useState<boolean>(false);

  const account_address = account?.address?.toString();

  useEffect(() => {
    setNotificationActive(false);
    getCandyMachineResourceData();
  }, [wallet]);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const timeout = (delay: number) => new Promise(res => setTimeout(res, delay));

  const mint = async () => {
    if (!account_address) {
      setNotificationActive(true);
      await timeout(3000);
      setNotificationActive(false);
      console.log('account_address undefined');
      return;
    }

    const quantitySpan = document.getElementById('quantityField') as HTMLSpanElement | null;
    if (!quantitySpan) {
      console.error('Quantity span element not found');
      return;
    }

    const quantity = parseInt(quantitySpan.textContent as any, 10);
    if (isNaN(quantity)) {
      console.error('Invalid quantity value');
      return;
    }

    let txInfo;
    try {
      console.log('setMinting before');
      setMinting(true);
      console.log('setMinting after');
      const txHash = await signAndSubmitTransaction({
        sender: account_address,
        data: {
          function: `${CONTRACT_ADDRESS}::minting::mint_token`,
          typeArguments: [],
          functionArguments: [quantity],
        },
      });
      console.log('txHash ::', txHash.hash);
      setMinting(false);
      getCandyMachineResourceData();
      toast.success(
        <div>
          <strong>Minting Success!</strong>
          <a
            href={`https://explorer.aptoslabs.com/txn/${txHash.hash}?network=${NETWORK_STR}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p>View Transaction</p>
          </a>
        </div>
      );
    } catch (err: any) {
      txInfo = {
        success: false,
        vm_status: err.message,
      };
      setMinting(false);
    }
  };

  const getCandyMachineResourceData = async () => {
    const response = await axios.get(`${NODE_URL}/accounts/${CONTRACT_ADDRESS}/resources`);
    const resources = response.data;

    for (const resource of resources) {
      if (resource.type === `${CONTRACT_ADDRESS}::minting::CollectionCreator`) {
        const data = resource.data;
        setCurrentSupply(data.current_supply);
        setMaxSupply(data.maximum_supply);
        setCollectionName(data.collection_name);

        setMintFee(data.presale_status ? data.per_sale_price : data.public_price);
      }
    }
  };

  return (
    <div className="bg-gray-500">
      <div className={styles.container}>
        <Head>
          <title>Aptos-NFT-Dapp</title>
          <meta name="description" content="Aptos NFT Mint" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>

        <img src={collectionBackgroundUrl} alt="background" className={styles.bg_image} />
        <div className={styles.bg_filter}></div>

        <main className={styles.main}>
          <h1 className={styles.title}>{collectionName ?? 'Aptos Ninja NFT'}</h1>
          <div className={styles.topcorner}>
            <ConnectWalletButton connectButton={!connected} className="d-flex" />
          </div>
          <img src={collectionCoverUrl} className={styles.mintimage} alt="mint-preview" />

          <div
            id="collection-info"
            className="d-flex flex-column align-items-center text-white"
            style={{ width: '80%' }}
          >
            <QuantityToggle onChange={handleQuantityChange} />

            <div className="d-flex align-items-center my-3">
              <button className={styles.button} onClick={mint}>
                {minting ? (
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ) : (
                  'Mint'
                )}
              </button>
            </div>

            <div className={styles.mintstats}>
              <div className={styles.spacebetween}>
                <h6>Mint fee:</h6>
                <h6 id="mintfee">{mintFee ? mintFee / 100000000 : 0} APT</h6>
              </div>

              <div className={styles.spacebetween}>
                <h6>Current Supply:</h6>
                <h6>{currentSupply ?? 0}</h6>
              </div>

              <div className={styles.spacebetween}>
                <h6>Maximum Supply:</h6>
                <h6>{maxSupply ?? 'N/A'}</h6>
              </div>
            </div>

            <div
              className={`${styles.notification} ${
                notificationActive ? styles.visible : styles.hidden
              }`}
            >
              <h6 className={styles.notificationtext}>
                Please connect your wallet at the top right of the page
              </h6>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
