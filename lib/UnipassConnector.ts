import { Signer } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers';
import { Chain, Connector, ConnectorData } from 'wagmi'
import { PopupSDKOption, UniPassPopupSDK } from '@unipasswallet/popup-sdk'

export class UnipassConnector extends Connector {

  readonly id = "Unipass"
  readonly name = "Unipass Wallet"
  readonly ready = true

  private unipass

  constructor(config: { chains?: Chain[], options: PopupSDKOption }) {
    super(config)
    this.unipass = new UniPassPopupSDK(this.options)
  }

  async connect(config?: { chainId?: number | undefined } | undefined): Promise<Required<ConnectorData<any>>> {

    const chainId = config?.chainId

    try {
      this.emit('message', {
        type: 'connecting'
      });
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
    return await this.unipass.getAddress()
  }

  async disconnect(): Promise<void> {
    return await this.unipass.logout()
  }

  async isAuthorized(): Promise<boolean> {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  async getChainId(): Promise<number> {
    const provider = await this.getProvider() as JsonRpcProvider
    return (await provider.getNetwork()).chainId
  }

  async getProvider(config?: { chainId?: number | undefined } | undefined): Promise<any> {
    return await this.unipass.getProvider()
  }

  async getSigner(config?: { chainId?: number | undefined } | undefined): Promise<Signer> {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()]);
    return provider.getSigner(account)
  }

  async sendTransaction(_tx: any): Promise<string> {
    return this.unipass.sendTransaction(_tx)
  }

  protected async onDisconnect(error: Error) {

  }

  protected async onAccountsChanged(accounts: string[]) {

  }

  protected async onChainChanged(chain: string | number) {

  }
}