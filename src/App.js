import React from 'react'
import './App.css';
import Web3Modal from 'web3modal';
import Web3 from 'web3';
import WalletConnectProvider from "@walletconnect/web3-provider";
import {abi,address} from './contracts/contract.js';
import {abiERC20,addressERC20} from './contracts/ERC20contract.js';
import Timer from './component/timer.js';
import toast, { Toaster } from 'react-hot-toast';
import LOGO from './img/logo.svg';


let provider = new Web3.providers.HttpProvider("https://solitary-white-resonance.bsc.quiknode.pro/c3da696af060963d4a84ad5c12dbe3cee94578d1/");
let presale;
let erc20;
let web3 = new Web3(provider);



const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: {
        56: "https://bsc-dataseed.binance.org/",
        infuraId: "49fee55cddc14fb3b4599ec384c34b1f"
      },
      network: "binance"
    }
  }
};


const web3Modal = new Web3Modal({
  network: "binance", // optional
  cacheProvider: true, // optional
  providerOptions // required
});




class App extends React.Component {
  state={
    connected: false,
    account: "0",
    hardcap: "0",
    minCon: "0",
    maxCon: "0",
    tokenPrice: "0",
    currentAmount: "0",
    tokensReceive: "0",
    userCon:"0",
    refreshdata: false,
    balanceContract: "14000",
    value: "",
    chainId: 0,
    confirmbutton: "Enter value in BUSD",
    approving: false,
    approved: false,
    confirmbutton2: "Approve",
    started: false,
    finished: false,
    claimbutton: "Claim",
    claimbable: false,
    refundable: false,
    refundbutton: "Refund",
    tokens: 0,
    count:0,
    balanceBNB: 0,
    balanceBUSD: 0
  }
  constructor(){
    super();
    this.nowallet();
  }

  nowallet=async()=>{
    web3 = new Web3(provider);
    presale= new web3.eth.Contract(abi,address);
    this.setState({
        hardcap: await presale.methods.hardCap().call(),
        minCon: await presale.methods.minCon().call(),
        maxCon: await presale.methods.maxCon().call(),
        tokenPrice: await presale.methods.BUSDperToken().call(),
        currentAmount: await presale.methods.collected().call(),
        address: await presale.options.address,
        approved: false,
        started: await presale.methods.started().call(),
        finished: await presale.methods.finished().call(),
        claimable: await presale.methods.claimable().call(),
        refundable: await presale.methods.cancelPS().call()
      });

  }
  fetchdata=async()=>{
    web3 = new Web3(provider);
    const chainId = await web3.eth.getChainId();
    if (chainId!==56) {
      const accounts = await web3.eth.getAccounts();
      this.setState({
        account: accounts[0],
        chainId: "Unsupported",
        connected: true
      });
      try{
        window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
         chainId: '0x38',
         chainName: 'Binance Smart Chain',
         nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
         rpcUrls: ['https://bsc-dataseed1.ninicoin.io'],
         blockExplorerUrls: ['https://bscscan.com/']
        }]
      });
      }catch(e){
        console.log(e);
      }

    } else {
    const accounts = await web3.eth.getAccounts();


    presale= new web3.eth.Contract(abi,address);
    erc20= new web3.eth.Contract(abiERC20,addressERC20);



    this.setState({
      account: accounts[0],
      chainId: chainId,
      connected: true,
      hardcap: await presale.methods.hardCap().call(),
      minCon: await presale.methods.minCon().call(),
      maxCon: await presale.methods.maxCon().call(),
      tokenPrice: await presale.methods.BUSDperToken().call(),
      currentAmount: await presale.methods.collected().call(),
      tokensReceive: await presale.methods.tokenToReceive(accounts[0]).call({from: accounts[0]}),
      userCon: await presale.methods._contribution(accounts[0]).call({from: accounts[0]}),
      address: await presale.options.address,
      started: await presale.methods.started().call(),
      finished: await presale.methods.finished().call(),
      claimable: await presale.methods.claimable().call(),
      refundable: await presale.methods.cancelPS().call(),
      balanceBNB: await web3.eth.getBalance(accounts[0]),
      balanceBUSD: await erc20.methods.balanceOf(accounts[0]).call()
    });
  }
}
  refreshdata=async()=>{
    await this.fetchdata();
  }
  refreshbutton=async()=>{
    this.setState({
      hardcap: await presale.methods.hardCap().call(),
      minCon: await presale.methods.minCon().call(),
      maxCon: await presale.methods.maxCon().call(),
      tokenPrice: await presale.methods.BUSDperToken().call(),
      currentAmount: await presale.methods.collected().call(),
      tokensReceive: await presale.methods.tokenToReceive(this.state.account).call({from: this.state.account}),
      userCon: await presale.methods._contribution(this.state.account).call({from: this.state.account}),
      address: await presale.options.address,
      started: await presale.methods.started().call(),
      finished: await presale.methods.finished().call(),
      claimable: await presale.methods.claimable().call(),
      refundable: await presale.methods.cancelPS().call(),
      balanceBNB: await web3.eth.getBalance(this.state.account),
      balanceBUSD: await erc20.methods.balanceOf(this.state.account).call()
    });
  }

  Onconnect= async ()=>{
      try {
        await web3Modal.clearCachedProvider();
        provider = await web3Modal.connect();
        console.log(provider);

      } catch(e) {
        provider="https://solitary-white-resonance.bsc.quiknode.pro/c3da696af060963d4a84ad5c12dbe3cee94578d1/";
        console.log("Could not get a wallet connection", e);
        return;
      }
      this.fetchdata();

      provider.on("accountsChanged", (accounts: string[]) => {
        console.log(accounts);
        this.fetchdata();
      });


        // Subscribe to chainId change
      provider.on("chainChanged", (chainId: number) => {
        console.log(chainId);
        this.fetchdata();
      });

        // Subscribe to provider connection
      provider.on("connect", (info: { chainId: number }) => {
        console.log(info);
        this.fetchdata();
      });

        // Subscribe to provider disconnection
      provider.on("disconnect", (error: { code: number; message: string }) => {
        console.log(error);
        this.onDisconnect();
      });
      await this.refreshdata;
  }
  onDisconnect=async()=> {
    // TODO: Which providers have close method?
    if(provider.close) {
      await provider.close();

      // If the cached provider is not cleared,
      // WalletConnect will default to the existing session
      // and does not allow to re-scan the QR code with a new wallet.
      // Depending on your use case you may want or want not his behavir.
      provider = new Web3.providers.HttpProvider("https://solitary-white-resonance.bsc.quiknode.pro/c3da696af060963d4a84ad5c12dbe3cee94578d1/");
      web3 = new Web3(provider);

    }

    this.setState({
      connected: false,
      account: "0x00000000",
      chainId: 0,

    });
  }
  handleChange=async(event)=>{
    await this.setState({value: event.target.value});
    if(parseFloat(await erc20.methods.allowance(this.state.account,address).call())>=parseFloat(this.state.value)*1000000000000000000){
      this.setState({
        approved: true
      });
    } else {
      this.setState({
        approved: false
      })
    }
    if (await presale.methods._enteredPrivateSale(this.state.account).call()){
      await this.setState({
        confirmbutton2: "Already contributed",
        confirmbutton: "Already contributed",
        approving: true,
        tokens: 0
      });
    } else {
      await this.setState({
      confirmbutton2: "Incorrect BUSD value",
      confirmbutton: "Incorrect BUSD value",
      approving: true,
      tokens: 0
      })
      if ((parseFloat(this.state.value)*1000000000000000000+parseFloat(this.state.userCon)>=parseFloat(this.state.minCon))){
        if ((parseFloat(this.state.value)*1000000000000000000+parseFloat(this.state.userCon)<=parseFloat(this.state.maxCon))){
          await this.setState({
            confirmbutton2: "Approve",
            confirmbutton: "Contribute",
            approving: false,
            tokens: parseFloat(this.state.value)*1000000000000000000/parseFloat(this.state.tokenPrice)
          })
        }
      }
    }
  }
  handleSubmit= async (event)=> {
      try{
        this.setState({
          approving: true,
          confirmbutton: "Awaiting contribution"
        })
        await presale.methods.enterPrivateSale(web3.utils.toWei(this.state.value,"ether")).send({
            from: this.state.account,
            gas: 300000,
        });
        toast.success("Contributed to private sale successfully");
    }catch(e){
      toast.error(e.message);
    }
    this.setState({
      approving: false,
      confirmbutton: "Contribute",
      value: ""
    })

  }
  handleSubmitApprove= async (event)=> {
      try{
        this.setState({
          approving: true,
          confirmbutton2: "Awaiting approval"
        })
        await erc20.methods.approve(address,web3.utils.toWei(this.state.value,"ether")).send({
            from: this.state.account,
            gas: 300000,
        });
        this.setState({
          approved:true
        });
        toast.success('Token transfer approved');
    }catch(e){
      toast.error(e.message);
    }
    this.setState({
      approving: false,
      confirmbutton2: "Approve",
    })

  }

  handleSubmitClaim= async (event)=> {
      try{
        this.setState({
          approving: true,
          claimbutton: "Awaiting claim"
        })
        await presale.methods.Claim().send({
            from: this.state.account,
            gas: 300000,
        });
        toast.success("Claimed successfully");
    }catch(e){
      toast.error(e.message);
    }
    this.setState({
      approving: false,
      claimbutton: "Claim",
    })


  }
  handleSubmitRefund= async (event)=> {
      try{
        this.setState({
          approving: true,
          claimbutton: "Awaiting refund"
        })
        await presale.methods.Refund().send({
            from: this.state.account,
            gas: 300000,
        });
        toast.success("Refunded successfully");
    }catch(e){
      toast.error(e.message);
    }
    this.setState({
      approving: false,
      claimbutton: "Refund",
    })


  }

  render(){
    return (
      <div className="App">
        <header className="Header">
          <div className="App-header2">
            <div className="logo2">
              <img src={LOGO} className="logo"/>
            </div>
          </div>
          <div className="App-header">
            <button className="App-Button" onClick={
              (e) => {
              e.preventDefault();
              window.location.href='google.com';
              }
            }
            >
              Back
            </button>
            <div className="App-Account" style={{display : (this.state.connected ?'block' : 'none')}}>
              account:{this.state.account.substring(0,8)}...
              chainId:{this.state.chainId}
            </div>
            <div className="App-Account" style={{display : (this.state.connected&&this.state.chainId!="Unsupported" ?'block' : 'none')}}>
              <div>BUSD:{web3.utils.fromWei(this.state.balanceBUSD.toString(),'ether').substring(0,8)}</div>
              <div>BNB:{web3.utils.fromWei(this.state.balanceBNB.toString(),'ether').substring(0,8)}</div>
            </div>
            <button className="App-Button" style={{display : (this.state.connected ?'none' : 'block')}} onClick={this.Onconnect}>
              Connect
            </button>
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
              // Define default options
                className: '',
                duration: 10000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  border: '1px solid #713200',
                  padding: '16px'
                },
              // Default options for specific types
                success: {
                  duration: 10000,
                  theme: {
                    primary: 'green',
                    secondary: 'black',
                  },
                },
                error: {
                  duration: 10000,
                  style: {
                    background: 'red',
                  },
                }
              }}
            />
            <button className="App-Button" style={{display : (this.state.connected ?'block' : 'none')}}onClick={this.onDisconnect}>
              Disconnect
            </button>
          </div>
        </header>
        <main className="App-main">
            <button className="refresh-button" style={{display : (!this.state.connected&&this.state.chainId!="Unsupported" ?'block' : 'none')}} onClick={this.nowallet}>
              Refresh
            </button>
            <button className="refresh-button" style={{display : (this.state.connected ?'block' : 'none')}} onClick={this.refreshbutton}>
              Refresh
            </button>

            <b>PRIVATE SALE STATS:</b>
            <div className="details_list">
              <div className="details_box">
                <div className="details_category"><b>MIN ENTRY:</b></div>
                <div>
                  {web3.utils.fromWei(this.state.minCon,'ether')} BUSD
                </div>
              </div>
              <div className="details_box">
                <div className="details_category"><b>MAX ENTRY:</b></div>
                <div>
                  {web3.utils.fromWei(this.state.maxCon,'ether')} BUSD
                </div>
              </div>
              <div className="details_box">
                <div className="details_category"><b>TOTAL ALLOCATION:</b></div>
                <div>{this.state.balanceContract} PHOX</div>
              </div>
              <div className="details_box">
                <div className="details_category"><b>BUSD per TOKEN: </b> </div>
                <div>{web3.utils.fromWei(this.state.tokenPrice,'ether')} BUSD</div>
              </div>
            </div>
            <b>PRIVATE SALE PROGRESS:</b>
            <div className="details_list">
              <div className="details_box" style={{display: this.state.started? "block" : "none"}}>
                <div className="details_category">
                  TOTAL RAISED BUSD:
                </div>
                <div>
                  {parseFloat(web3.utils.fromWei(this.state.currentAmount,'ether'))} BUSD
                </div>
              </div>
              <div className="details_box">
                <div className="details_category">
                  HARDCAP:
                </div>
                <div>
                  {parseFloat(web3.utils.fromWei(this.state.hardcap,'ether'))} BUSD
                </div>
              </div>
            </div>
            <b style={{display : (this.state.connected&&this.state.chainId!="Unsupported" ?'block' : 'none')}}>
              YOUR STATS:
            </b>
            <div className="details_list" style={{display : (this.state.connected&&this.state.chainId!="Unsupported" ?'flex' : 'none')}}>
              <div className="details_box">
                <div className="details_category">
                  YOUR CONTRIBUTED AMOUNT:
                </div>
                <div>
                  {web3.utils.fromWei(this.state.userCon,'ether')} BUSD
                </div>
              </div>
              <div className="details_box">
                <div className="details_category">
                  YOUR RESERVED TOKENS:
                </div>
                <div>
                  {web3.utils.fromWei(this.state.tokensReceive,'ether')} PHOX
                </div>
              </div>
            </div>
            <div style={{display: this.state.started? "block" : "none"}}>
              <b>PRIVATE SALE PROGRESS</b>
            </div>
            <div id="progressbar" style={{display: this.state.started? "block" : "none"}}>
              <div style={{width : parseInt((parseFloat(web3.utils.fromWei(this.state.currentAmount,'ether')))/(parseFloat(web3.utils.fromWei(this.state.hardcap,'ether')))*100).toString()+"%"
              }}>
              </div>
            </div>
            <div style={{display: this.state.started? "block" : "none"}}>
              <b>TIME LEFT:</b>
              <Timer/>
            </div>
            <br/>
            <b style={{display : (this.state.connected&&this.state.chainId!="Unsupported"&&this.state.started&&!this.state.finished ?'block' : 'none')}}>Enter amount in BUSD:</b>
            <br/>
            <label style={{display : (this.state.connected&&this.state.chainId!="Unsupported"&&this.state.started&&!this.state.finished ?'block' : 'none')}}>

              <input className="input-value" type="text" value={this.state.value} onChange={this.handleChange} />
              <div style={{ display : this.state.connected&&this.state.chainId!="Unsupported"&&this.state.started&&!this.state.finished&&!this.state.tokens==0 ? 'block' : 'none'}}>PHOX to receive:{this.state.tokens}
              </div>
            </label>
            <button className="App-Button-submit" onClick={this.handleSubmitApprove} style={{ display : this.state.connected&&this.state.chainId!="Unsupported"&&!this.state.approved&&this.state.started&&!this.state.finished&&!this.state.value=="" ?'block' : 'none'}} disabled={this.state.approving ? true : false}>{this.state.confirmbutton2}</button>
            <button className="App-Button-submit" onClick={this.handleSubmit} style={{ display : (this.state.connected&&this.state.chainId!="Unsupported"&&this.state.approved&&this.state.started&&!this.state.finished&&!this.state.value=="" ?'block' : 'none')}} disabled={this.state.approving ? true : false}>{this.state.confirmbutton}</button>
            <button className="App-Button-submit" onClick={this.handleSubmitClaim} style={{ display : (this.state.connected&&this.state.chainId!="Unsupported"&&this.state.started&&this.state.finished&&!this.state.refundable ?'block' : 'none')}} disabled={!this.state.approving&&this.state.claimable ? false : true}>{this.state.claimbutton}</button>
            <button className="App-Button-submit" onClick={this.handleSubmitRefund} style={{ display : (this.state.connected&&this.state.chainId!="Unsupported"&&this.state.started&&this.state.finished&&this.state.refundable ?'block' : 'none')}} disabled={!this.state.approving&&this.state.refundable ? false : true}>{this.state.refundbutton}</button>
            <br/>
            <div className="details_list">
              <div className="details_box">
                Binance Smart Chain has had gas issues recently, we recommend that you increase GWEI to 10 before confirming the transaction.
              </div>
            </div>
          </main>
          <footer className="footer">
            <p className="contractaddress">PRIVATE SALE CONTRACT:</p>
            <p className="contractaddress">{address}</p>
            <p className="contractaddress">Copyright © 2021 Phoenix TTM DAO | All Rights Reserved</p>
          </footer>
        </div>




    );
  }
}

export default App;
