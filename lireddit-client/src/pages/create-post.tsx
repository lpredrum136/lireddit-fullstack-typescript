import { Box, Button } from '@chakra-ui/react'
import { Formik, Form, FormikHelpers } from 'formik'
import InputField from '../components/InputField'
import {
  CreatePostInput,
  useCreatePostMutation,
  useMeQuery
} from '../generated/graphql'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useEffect } from 'react'

const CreatePost = () => {
  // Router Next
  const router = useRouter()

  // GraphQL
  const [createPost, _] = useCreatePostMutation()

  // Protect route
  const { data, loading } = useMeQuery() // under the hood, this is checking in the graphql cache, so you don't waste resource making http request to server
  useEffect(() => {
    if (!loading && !data?.me) {
      router.replace('/login')
    }
  }, [data, loading, router])

  // Formik
  const initialValues = { title: '', text: '' }
  const onCreatePostSubmit = async (
    values: CreatePostInput,
    { setErrors: _ }: FormikHelpers<CreatePostInput>
  ) => {
    try {
      await createPost({
        variables: { createPostInput: values }
      })
      router.push('/')
    } catch (error) {
      // do nothing, global apolloClient handles this
    }
  }

  // return
  if (loading) return <p>Checking authentication...</p>
  else if (!loading && !data?.me) return <p>Redirecting to login...</p>
  else {
    return (
      <Layout variant="small">
        <Formik initialValues={initialValues} onSubmit={onCreatePostSubmit}>
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
                Create Post
              </Button>
            </Form>
          )}
        </Formik>
      </Layout>
    )
  }
}

export default CreatePost
