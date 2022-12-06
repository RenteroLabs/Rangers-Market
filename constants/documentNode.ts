import { gql } from '@apollo/client'

export const GET_LEASES = gql`
  query($skip: Int!, $pageSize: Int!) {
    leases(skip: $skip, first: $pageSize, orderDirection: asc, orderBy: expires) {
        deposit
        daysPerPeriod
        erc20Address
        expires
        id
        lender
        maxRentalDays
        minRentalDays
        nftAddress
        rentPerDay
        renter
        tokenId
        whitelist
        chain
        paidExpires
        start
    }
  }
`

// 获取指定游戏市场上 NFT 总数
export const GET_GAME_LEASES_COUNT = gql`
  query($contractAddresses: [String]!) {
    summaries(where: {id_in: $contractAddresses}) {
      id
      leaseCount
    }
  }
`

export const GET_LEASES_BY_GAME = gql`
  query($skip: Int!, $pageSize: Int!, $collections: [String]!) {
    leases(
      skip: $skip, 
      first: $pageSize, 
      orderDirection: asc, 
      orderBy: expires,
      nftAddress_in: $collections
      ) {
        deposit
        daysPerPeriod
        erc20Address
        expires
        id
        lender
        maxRentalDays
        minRentalDays
        nftAddress
        rentPerDay
        renter
        tokenId
        whitelist
        chain
        paidExpires
        start
    } 
  }
`

export const GET_TOTAL_LEASES = gql`
  query($id: String!) {
    summary(id: $id) {
      id 
      leaseCount
    }
  }
`


export const GET_LEASE_INFO = gql`
  query($id: String!) {
    lease(id: $id) {
      deposit
      daysPerPeriod
      erc20Address
      expires
      id
      lender
      minRentalDays
      maxRentalDays
      nftAddress
      rentPerDay
      renter
      tokenId
      whitelist
      chain
      paidExpires
      start
    }
  }
`

export const GET_MORE_RECOMMENDED_FOUR = gql`
  query($nftAddress: String!, $tokenId: String!, $expires: String!) {
    leases(first: 4, where: {
      nftAddress: $nftAddress,
      tokenId_not: $tokenId,
      expires_lt: $expires
    }) {
      deposit
      daysPerPeriod
      erc20Address
      expires
      id
      lender
      minRentalDays
      maxRentalDays
      nftAddress
      rentPerDay
      renter
      tokenId
      whitelist
      chain
      paidExpires
      start
    }
  } 
`


export const GET_MY_RENTING = gql`
  query($renter: String!, $timestamp: String!) {
    leases(where: { renter: $renter, expires_gt: $timestamp}) {
        deposit
        daysPerPeriod
        erc20Address
        expires
        id
        lender
        maxRentalDays
        minRentalDays
        nftAddress
        rentPerDay
        renter
        tokenId
        whitelist
        chain
        paidExpires
        start
    } 
  }
`

export const GET_MY_LENDING = gql`
  query($lender: String!) {
    leases(where: { lender: $lender}) {
        deposit
        daysPerPeriod
        erc20Address
        expires
        id
        lender
        maxRentalDays
        minRentalDays
        nftAddress
        rentPerDay
        renter
        tokenId
        whitelist
        chain
        paidExpires
        start
    }
  }
`