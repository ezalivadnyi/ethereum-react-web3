import React, {useEffect, useState} from "react";
import Web3 from "web3";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    Grid,
    IconButton,
    Input,
    InputLabel,
    Tooltip,
    Typography
} from "@material-ui/core";
import {Refresh, Send} from "@material-ui/icons";
import {TransactionReceipt} from "web3-eth"
import {abi} from "./jsonInterfaceABI";
import {provider} from "web3-core";

const WALLET_ADDRESS_MAX_LENGTH = 42
const INPUT_WIDTH = 390
const DIVIDE_VALUE = 1000000000000000000

const lastBalanceValue = localStorage.getItem('lastBalanceValue')

const Ethereum: React.FC = () => {
    const [isConnected, setIsConnected] = useState(window?.ethereum?.isConnected() || false)
    const [isLoading, setIsLoading] = useState(false)
    const [isConnectionRequestPending, setIsConnectionRequestPending] = useState(false)
    const [sender, setSender] = useState('0x0FAde8c8Ca8b72E3A3384C0447f8E7c2BE721b10')
    const [recipient, setRecipient] = useState('0x2d30B8451a68B5026B086D3D9A0179740eE53600')
    const [amount, setAmount] = useState(0)

    // Response
    const [transactionHash, setTransactionHash] = useState('')
    const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceipt | null>(null)
    const [balance, setBalance] = useState<number | null>(lastBalanceValue && +lastBalanceValue ? +lastBalanceValue : null)

    // 0x3	3	Ropsten Test Network

    const web3 = new Web3(window?.ethereum as provider)
    const contract = new web3.eth.Contract(abi, '0x6b304e591bfb132d2c9a11e4F016270767200CFD', {
        from: '0x0FAde8c8Ca8b72E3A3384C0447f8E7c2BE721b10'
    })

    // console.log(web3.utils.toWei(amount.toString()))
    const getBalanceOf = () => {
        setIsLoading(true)
        contract?.methods?.balanceOf(sender).call()
            .then((value: any) => {
                const res = +value / DIVIDE_VALUE
                localStorage.setItem('lastBalanceValue', res.toString())
                setBalance(+res)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        if (sender) {
            getBalanceOf()
        }
    }, [])

    useEffect(() => {
        if (sender) {
            getBalanceOf()
        }
    }, [sender])

    const handleTransfer = async () => {
        if (!balance || balance < amount) {
            alert('Недостаточно средств на балансе')
            return
        }

        const estimateGas = await contract.methods.transfer(recipient, web3.utils.toWei(amount.toString())).estimateGas({
            from: sender
        })
        console.log({sender})

        contract.methods.transfer(recipient, web3.utils.toWei('100', 'ether'))
            //        contract.methods.transfer(recipient, web3.utils.toWei(amount.toString()))
            .send({
                from:  '0x1b1872BE0f8685B234c487ECec406f7770ca63eD',
                // gas: estimateGas,
                // gasPrice: '30000000000000',
                // value: web3.utils.toWei(amount.toString())
            })
            .on('error', (error: any) => {
                console.error(error)
            })
            .on('transactionHash', (transactionHash: string) => {
                setTransactionHash(transactionHash)
            })
            .on('receipt', (receipt: TransactionReceipt) => {
                console.log(receipt)
                //console.log(receipt.contractAddress) // contains the new contract address
            })
            .on('confirmation', (confirmationNumber: any, receipt: any) => {
                console.log({confirmationNumber})
                console.log({receipt})
            })
            .then(function(newContractInstance: any){
                console.log(newContractInstance)
                // console.log(newContractInstance.options.address) // instance with the new contract address
            });
    }

    return <Container>
        {
            !isConnected
                ? <Button
                    variant='contained'
                    disabled={isConnectionRequestPending}
                    onClick={() => {
                        setIsConnectionRequestPending(true)
                        window.ethereum?.request({ method: 'eth_requestAccounts' })
                            .then((res: string[]) => {
                                setSender(res[0])
                                setIsConnected(true)
                            })
                            .finally(() => setIsConnectionRequestPending(false))
                    }}
                >
                    Connect to MetaMask
                </Button>
                :  <Typography align='center'>MetaMask is connected.</Typography>
        }

        <Box pt={1} pb={1}>
            <Divider/>
        </Box>
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <div>
                    <Box justifyContent='center' alignItems='center' display='flex'>
                        <span>Balance: {balance || balance === 0 ? balance : 'Unknown'}</span>
                        <Tooltip title='Refresh balance'>
                            <IconButton
                                disabled={sender.length !== WALLET_ADDRESS_MAX_LENGTH}
                                onClick={() => getBalanceOf()}
                                size='small'
                            >
                                {isLoading ? <CircularProgress size={14}/> : <Refresh fontSize='small'/>}
                            </IconButton>
                        </Tooltip>

                    </Box>
                </div>

                {
                    transactionHash &&
                    <div>Transaction Hash: {transactionHash}</div>
                }
                {
                    transactionReceipt &&
                    <>
                        <div>
                            <strong>Transaction Receipt</strong>
                        </div>
                        <div>Gas Used: {transactionReceipt.gasUsed}</div>
                        <div>Cumulative Gas Used: {transactionReceipt.cumulativeGasUsed}</div>
                        <div>Block Hash: {transactionReceipt.blockHash}</div>
                        <div>Block Number: {transactionReceipt.blockNumber}</div>
                        <div>Contract Address: {transactionReceipt.contractAddress}</div>
                    </>
                }

            </Grid>
            <Grid item xs={6}>
                <div>
                    <FormControl error={!sender}>
                        <InputLabel htmlFor="fromValue">From (Sender): </InputLabel>
                        <Input
                            style={{width: INPUT_WIDTH}}
                            id='fromValue'
                            type="text"
                            value={sender}
                            onChange={event => setSender(event.target.value)}
                            inputProps={{
                                max: WALLET_ADDRESS_MAX_LENGTH
                            }}
                        />
                    </FormControl>
                </div>

                <div>
                    <FormControl error={!recipient}>
                        <InputLabel htmlFor="toValue">To (Recipient): </InputLabel>
                        <Input
                            style={{width: INPUT_WIDTH}}
                            id='toValue'
                            type="text"
                            value={recipient}
                            onChange={event => setRecipient(event.target.value)}
                            inputProps={{
                                max: WALLET_ADDRESS_MAX_LENGTH
                            }}
                        />
                    </FormControl>
                </div>

                <div>
                    <FormControl error={!amount}>
                        <InputLabel htmlFor="amount">Amount: </InputLabel>
                        <Input
                            id='toValue'
                            type="number"
                            name='amount'
                            inputProps={{
                                min: 0,
                                max: balance,
                                step: 0.00001,
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
                    onClick={() => handleTransfer()}
                    startIcon={<Send/>}
                    disabled={!balance || !amount || recipient.length !== WALLET_ADDRESS_MAX_LENGTH || sender.length !== WALLET_ADDRESS_MAX_LENGTH}
                >
                    Send
                </Button>
            </Grid>
        </Grid>

    </Container>
}

export default Ethereum
