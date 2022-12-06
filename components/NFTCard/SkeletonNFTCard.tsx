import react from 'react'
import { Box, Card, Skeleton } from '@mui/material'
import styles from './index.module.scss'

const SkeletonNFTCard: React.FC = () => {
  return <Card className={styles.skeletonCard}>
    <Skeleton variant="rectangular" className={styles.nftImage} />
    <Box sx={{ display: 'flex', m: '1.33rem 1.33rem 1rem', alignItems: 'center' }}>
      <Skeleton variant="rectangular" className={styles.nftLogo} />
      <Skeleton variant="rectangular" sx={{ width: '70%', ml: '1rem' }} height="2rem" />
    </Box>
    <Skeleton variant="rectangular"
      sx={{ margin: '0 1.33rem 0.5rem' }}
      height="2rem" />
  </Card>
}

export default SkeletonNFTCard