import React, { ReactNode } from 'react'
import { PropsWithChildren } from "react";
import styles from '../styles/layout2.module.scss'

import Footer from "./Footer";
import Header from "./Header";

const Layout: React.FC<PropsWithChildren<any>> = ({ children }) => {
  return <div className={styles.layout}>
    <Header />
    <div className={styles.container}>{children}</div>
  </div>
}

export default Layout
