export interface OrderInfo {
  borrowAddress: string,
  borrowerEarnRatio: number,
  currencyKind: string,
  expectedInCome: number,
  lenderAddress: string,
  lenderEarnRatio: number,
  minGain: number,
  newIncomeTime: string | number,
  newIncomeValue: number,
  nftUid: number,
  orderId: number,
  orderTime: number,
  propertyUrl: string,
  skuId: number,

  /** 
   * 订单状态 
   * 
   * Doing: 租借中
   * Finish: 完成
   * BCancel: 借用方申请取消
   * LCancel: 出租方申请取消
   * Cancel: 取消
   */
  status: 'Doing' | 'Finish' | 'BCancel' | 'LCancel' | 'Cancel',

  /**
   * 商品 SKU 状态
   * 
   * Active: 上架中
   * Renting: 租借中
   * TakeDown: 已下架
   * Delete: 已下架
   */
  itemStatus: 'Active' | 'Renting' | 'TakeDown' | 'Delete'
  totalInComeValue: number,
  wrapNftAddress: string,
  gameName: string;
  imageUrl: string;
  whiteAddress: string;
  metadata: string;
  mode: 'FreeTrial' | 'Dividend'
}