import { Box, Button } from '@chakra-ui/react'
import { Formik, Form, FormikHelpers } from 'formik'
import InputField from '../components/InputField'
import { CreatePostInput, useCreatePostMutation } from '../generated/graphql'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useCheckAuth } from '../utils/useCheckAuth'

const CreatePost = () => {
  // Router Next
  const router = useRouter()

  // Protect route and redirect
  const { data, loading } = useCheckAuth()

  // GraphQL
  const [createPost, _] = useCreatePostMutation()

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
