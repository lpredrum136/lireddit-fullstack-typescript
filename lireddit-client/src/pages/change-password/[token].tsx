import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

const ChangePassword = ({
  token
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return <div>changepassword</div>
}

// Phai viet day du kieu nay thi o ben tren phan const ChangePassword({token}) thi token o do moi la dang string

export const getServerSideProps: GetServerSideProps<{
  token: string
}> = async ({ params }) => {
  return {
    props: {
      token: params!.token as string
    }
  }
}

export default ChangePassword
