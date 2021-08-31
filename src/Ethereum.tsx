import React, {useEffect, useState} from "react";
import Web3 from "web3";
import {
    Box,
    Button,
    CircularProgress,
    Container, Divider,
    FormControl, Grid,
    IconButton,
    Input,
    InputLabel,
    Tooltip, Typography
} from "@material-ui/core";
import {Refresh, Send} from "@material-ui/icons";
import {TransactionReceipt} from "web3-eth"

const WALLET_MAX_LENGTH = 42
const lastBalanceValue = localStorage.getItem('lastBalanceValue')

const Ethereum: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [fromValue, setFromValue] = useState('0x0FAde8c8Ca8b72E3A3384C0447f8E7c2BE721b10')
    const [toValue, setToValue] = useState('0x2d30B8451a68B5026B086D3D9A0179740eE53600')
    const [amount, setAmount] = useState(0)

    // Response
    const [transactionHash, setTransactionHash] = useState('')
    const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceipt | null>(null)
    const [balance, setBalance] = useState<number | null>(lastBalanceValue && +lastBalanceValue ? +lastBalanceValue : null)

    // @ts-ignore
    const web3 = new Web3(window?.ethereum || {})

    const getBalance = () => {
        setIsLoading(true)
        web3.eth.getBalance(fromValue)
            .then(value => {
                const res = +value / 1000000000000000000
                localStorage.setItem('lastBalanceValue', res.toString())
                setBalance(+res)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        if(fromValue.length === WALLET_MAX_LENGTH) {
            getBalance()
        }
    }, [])

    useEffect(() => {
        if(fromValue.length === WALLET_MAX_LENGTH) {

        }
    }, [fromValue])

    const handleSend = () => {
        if(!fromValue || !toValue) return
        if(!balance) {
            alert('Недостаточно средств на балансе')
        } else {
            web3.eth.sendTransaction({
                from: fromValue,
                to: toValue,
                data: '0x432...',
            })
                .once('sending', function(payload){
                    console.log('sending', payload)
                })
                .once('sent', function(payload){
                    console.log('sent', payload)
                })
                .once('transactionHash', function(hash){
                    console.log('transactionHash', hash)
                    setTransactionHash(hash)
                })
                .once('receipt', (receipt) => {
                    console.log('receipt', receipt)
                })
                .on('confirmation', (confNumber, receipt, latestBlockHash) => {
                    console.log('confNumber', confNumber)
                    console.log('receipt', receipt)
                    console.log('latestBlockHash', latestBlockHash)
                })
                .on('error', (error) => {
                    console.error(error)
                })
                .then((receipt) => {
                    console.log('fired once the receipt is mined', receipt)
                    setTransactionReceipt(receipt)
                });
        }
    }

    return <Container>
        <Typography align='center'>MetaMask detected.</Typography>
        <Box pt={1} pb={1}>
            <Divider/>
        </Box>
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <div>
                    <span>Sender Balance: {balance ? balance + ' ETH' : 'Unknown'}</span>
                    <Tooltip title='Refresh balance'>
                        <IconButton
                            disabled={fromValue.length !== WALLET_MAX_LENGTH}
                            onClick={() => getBalance()}
                            size='small'
                        >
                            {isLoading ? <CircularProgress size={14}/> : <Refresh fontSize='small'/>}
                        </IconButton>
                    </Tooltip>
                </div>
            </Grid>
            <Grid item xs={6}>
                <div>
                    <FormControl error={!fromValue}>
                        <InputLabel htmlFor="fromValue">From (Sender): </InputLabel>
                        <Input
                            id='fromValue'
                            type="text"
                            value={fromValue}
                            onChange={event => setFromValue(event.target.value)}
                            style={{width: 330}}
                        />
                    </FormControl>
                </div>

                <div>
                    <FormControl error={!toValue}>
                        <InputLabel htmlFor="toValue">To (Receiver): </InputLabel>
                        <Input
                            id='toValue'
                            type="text"
                            value={toValue}
                            onChange={event => setToValue(event.target.value)}
                            style={{width: 330}}
                        />
                    </FormControl>
                </div>

                <div>
                    <FormControl error={!amount}>
                        <InputLabel htmlFor="amount">Amount: </InputLabel>
                        <Input
                            id='toValue'
                            type="number"
                            inputProps={{
                                min: 0,
                                step: 0.00001
                            }}
                            value={amount}
                            onChange={event => setAmount(+event.target.value)}
                            style={{width: 330}}
                        />
                    </FormControl>
                </div>

                <br/>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={() => handleSend()}
                    startIcon={<Send/>}
                    disabled={!balance || !amount || toValue.length !== WALLET_MAX_LENGTH || fromValue.length !== WALLET_MAX_LENGTH}
                >
                    Send
                </Button>
            </Grid>
        </Grid>

    </Container>
}

export default Ethereum
