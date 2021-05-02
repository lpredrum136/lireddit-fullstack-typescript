import { ReactNode } from 'react'
import Navbar from './Navbar'
import Wrapper from './Wrapper'

export type WrapperVariant = 'small' | 'regular'

interface ILayoutProps {
  children: ReactNode
  variant?: WrapperVariant
}

const Layout = ({ children, variant = 'regular' }: ILayoutProps) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  )
}

export default Layout
