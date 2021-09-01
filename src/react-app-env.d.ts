/// <reference types="react-scripts" />
import { provider } from 'web3-core';

interface IMetaMaskProvider extends provider{
    isConnected: () => boolean
    isMetaMask: boolean
    request: (any) => Promise<string[]>
    sendAsync: () => any
}

declare global {
    interface Window {
        ethereum: IMetaMaskProvider;
    }
}
