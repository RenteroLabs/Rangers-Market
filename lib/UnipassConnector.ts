import { Signer } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers';
import { Chain, Connector, ConnectorData } from 'wagmi'
import { PopupSDKOption, UniPassPopupSDK } from '@unipasswallet/popup-sdk'

export class UnipassConnector extends Connector {

  readonly id = "Unipass"
  readonly name = "Unipass Wallet"
  readonly ready = true

  private unipass: UniPassPopupSDK
  private isConnected: boolean = false

  constructor(config: { chains?: Chain[], options: PopupSDKOption, unipass: UniPassPopupSDK }) {
    super(config)
    // this.unipass = new UniPassPopupSDK(this.options)
    this.unipass = config.unipass
    console.log("construct", config.unipass)
  }

  async connect(config?: { chainId?: number | undefined } | undefined): Promise<Required<ConnectorData<any>>> {
    console.log("connect")
    const chainId = config?.chainId
    const wagmiStore = window.localStorage['wagmi.store']
    console.log(wagmiStore)

    try {
      // this.emit('message', {
      //   type: 'connecting'
      // });
      const account = await this.unipass.login({
        email: true,
        connectType: 'both',
        eventListener: (event: any) => {
          console.log("event", event)
        }
      })
      const { address } = account

      const provider = this.getProvider()

      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);

      if (chainId && id !== chainId) {
        // TODO: current not support switch chains by Unipass
        // const chain = await this.switchChain(chainId);
        // id = chain.id;
        // unsupported = this.isChainUnsupported(id);
      }
      this.isConnected = true



      return {
        account: address,
        chain: {
          id,
          unsupported
        },
        provider
      }
    } catch (err) {
      throw err
    }
  }

  async getAccount(): Promise<string> {
    console.log("getAccount")
    return await this.unipass.getAddress()
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
    console.log("disconnected")
    return await this.unipass.logout()
  }

  async isAuthorized(): Promise<boolean> {
    console.log("isAuthorized", this.isConnected)
    return true
    return this.isConnected
    try {
      const account = await this.unipass.getAddress();
      return !!account;
    } catch {
      return false;
    }
  }

  async getChainId(): Promise<number> {
    const provider = await this.getProvider() as JsonRpcProvider
    console.log("getChainId")
    return (await provider.getNetwork()).chainId
  }

  async getProvider(config?: { chainId?: number | undefined } | undefined): Promise<any> {
    console.log("getProvider")
    return await this.unipass.getProvider()
  }

  async getSigner(config?: { chainId?: number | undefined } | undefined): Promise<Signer> {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()]);
    console.log("getSigner")
    return provider.getSigner(account)
  }

  async sendTransaction(_tx: any): Promise<string> {
    console.log("sendTransaction")
    return this.unipass.sendTransaction(_tx)
  }

  protected async onDisconnect(error: Error) {
    console.log("onDisconnect")
  }

  protected async onAccountsChanged(accounts: string[]) {
    console.log("onAccountsChanged")
  }

  protected async onChainChanged(chain: string | number) {
    console.log("onChainChanged")
  }
}