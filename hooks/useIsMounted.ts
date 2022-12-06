import React, { useEffect, useState } from 'react'

export function useIsMounted() {
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => setMounted(true), [])
  
  return mounted
}