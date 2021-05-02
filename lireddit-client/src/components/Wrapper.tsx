import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { WrapperVariant } from './Layout'

interface IWrapperProps {
  children: ReactNode
  variant?: WrapperVariant
}

const Wrapper = ({ children, variant }: IWrapperProps) => {
  return (
    <Box
      maxW={variant === 'regular' ? '800px' : '400px'}
      w="100%"
      mt={8}
      mx="auto"
    >
      {children}
    </Box>
  )
}

export default Wrapper
