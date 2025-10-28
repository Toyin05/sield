export async function requestWalletPopup(): Promise<string[] | undefined> {
  try {
    if (typeof window === 'undefined') return undefined;
    console.log('requestWalletPopup: start');
    let eth: any = (window as any).ethereum || (window as any).web3?.currentProvider;

    if (!eth) {
      console.warn('requestWalletPopup: no injected provider found');
      // No injected provider — open MetaMask install page
      window.open('https://metamask.io/download.html', '_blank');
      return undefined;
    }

    // If multiple providers injected, prefer MetaMask
    if (Array.isArray(eth.providers)) {
      const mm = eth.providers.find((p: any) => p.isMetaMask);
      eth = mm || eth;
    }

    console.log('requestWalletPopup: calling eth.request to trigger provider UI');
    // Directly request accounts on the detected provider in response to user gesture
    const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });

    console.log('requestWalletPopup: accounts returned', accounts);
    if (accounts && accounts.length > 0) {
      // Dispatch a custom event so app-level wallet provider can pick up the account
      try {
        window.dispatchEvent(new CustomEvent('sield_wallet_connected', { detail: accounts[0] }));
      } catch (e) {
        // older browsers: fallback to using plain Event with global var
        (window as any).__sield_last_connected = accounts[0];
      }
      return accounts;
    }

    console.log('requestWalletPopup: no accounts returned');
    return undefined;
  } catch (err) {
    // Common error -32002 means request already pending; instruct user to check MetaMask UI
    console.error('requestWalletPopup error', err);
    throw err;
  }
}
