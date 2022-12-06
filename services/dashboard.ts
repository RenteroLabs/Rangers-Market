import qs from 'qs'
import { BaseURL } from '../constants'

/**
 * 出借者列表
 * @returns 
 */
export const lenderList = async ({ token, pageIndex }: { token: string, pageIndex: number }) => {
  const data = await fetch(`${BaseURL}/order/lending/list?pageIndex=${pageIndex}`, {
    headers: {
      sessionToken: token
    }
  })
  return await data.json()
}

/**
 * 借用者列表
 * @returns 
 */
export const borrowerList = async ({ token, pageIndex }: { token: string, pageIndex: number }) => {
  const data = await fetch(`${BaseURL}/order/borrow/list?pageIndex=${pageIndex}`, {
    headers: {
      sessionToken: token
    }
  })
  return await data.json()
}

/**
 * dashboard overview data
 * @param token 
 * @returns 
 */
export const overviewData = async (token: string) => {
  const data = await fetch(`${BaseURL}/dashboard/statistics`, {
    headers: {
      sessionToken: token
    }
  })
  return await data.json()
}

/**
 * wallet account list
 * @param token 
 * @returns 
 */
export const getWalletList = async (token: string) => {
  const data = await fetch(`${BaseURL}/account/list`, {
    headers: {
      sessionToken: token
    }
  })
  return await data.json()
}

/**
 * account bill record list
 * @param token 
 * @returns 
 */
export const getBillList = async (token: string) => {
  const data = await fetch(`${BaseURL}/account/bill/list`, {
    headers: {
      sessionToken: token
    }
  })
  return await data.json()
}

/**
 * 订单、账单记录
 * @param token 
 * @returns 
 */
export const getOperationRecord = async (token: string) => {
  const data = await fetch(`${BaseURL}/order/record/list`, {
    headers: {
      sessionToken: token
    }
  })
  return await data.json()
}