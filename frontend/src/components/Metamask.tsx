import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, Button, Typography, IconButton, Divider, Tooltip, CircularProgress, Alert } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useMetamask } from '../contexts/MetamaskContext';

const Metamask: React.FC = () => {
  const { provider, signer, network, connectMetamask, error: metamaskError  } = useMetamask();
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [networkChainId, setNetworkChainId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyAddress = () => {
    if (accountAddress) {
      navigator.clipboard.writeText(accountAddress);
    }
  };

  const fetchAccountDetails = async () => {
    setError(null);
    try {
      if (signer) {
        const address = await signer.getAddress();
        setAccountAddress(address);

        if (provider) {
          const balance = await provider.getBalance(address);
          setBalance(ethers.formatEther(balance.toString()));
        }
      }

      if (network) {
        setNetworkName(network.name);
        setNetworkChainId(network.chainId.toString());
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching account details:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleConnectMetamask = async () => {
    setError(null);
    setLoading(true);
    try {
      await connectMetamask();
      await fetchAccountDetails();
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error connecting Metamask:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (provider && signer && network) {
      fetchAccountDetails();
    }
  }, [provider, signer, network]);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleConnectMetamask} sx={{ mt: 2 }} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Connect Metamask'}
      </Button>
      {(metamaskError || error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {metamaskError || error}
        </Alert>
      )}
      {(accountAddress || balance || networkName || networkChainId) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {accountAddress && (
              <>
                <Typography variant="h6">
                  Account Address: <Typography component="span" variant="body1" color="textSecondary">
                    {accountAddress}
                    <Tooltip title="Copy to clipboard" placement="top">
                      <IconButton
                        aria-label="copy wallet address"
                        onClick={handleCopyAddress}
                        edge="end"
                        sx={{ ml: 1 }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </Typography>
              </>
            )}
            {balance && (
              <Typography variant="h6">
                Balance: <Typography component="span" variant="body1" color="textSecondary">
                  {balance}
                </Typography>
              </Typography>
            )}
            {(networkName && networkChainId) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">
                  Network Name: <Typography component="span" variant="body1" color="textSecondary">
                    {networkName}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  Chain ID: <Typography component="span" variant="body1" color="textSecondary">
                    {networkChainId}
                  </Typography>
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Metamask;
