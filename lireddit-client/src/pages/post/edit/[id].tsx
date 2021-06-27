import { Box, Button, Link } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import InputField from '../../../components/InputField'
import Layout from '../../../components/Layout'
import {
  UpdatePostInput,
  usePostQuery,
  useUpdatePostMutation
} from '../../../generated/graphql'

const EditPost = () => {
  const router = useRouter()
  const postId = router.query.id as string

  const { data, loading } = usePostQuery({
    variables: { id: postId }
  })
  const [updatePost, _] = useUpdatePostMutation()

  const onUpdatePostSubmit = async (values: Omit<UpdatePostInput, 'id'>) => {
    await updatePost({
      variables: { updatePostInput: { ...values, id: postId } }
    })
    // router.push('/')
    router.back()
  }

  if (loading)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    )

  if (!data?.post)
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    )

  const initialValues = { title: data.post.title, text: data.post.text }

  return (
    <Layout variant="small">
      <Formik initialValues={initialValues} onSubmit={onUpdatePostSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Title..."
              label="Title"
              type="text"
            />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="Text..."
                label="Text"
                type="textarea"
              />
            </Box>

            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
      <NextLink href="/">
        <Link>Go back to homepage</Link>
      </NextLink>
    </Layout>
  )
}

export default EditPost
