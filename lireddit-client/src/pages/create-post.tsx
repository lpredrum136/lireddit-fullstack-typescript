import { Box, Button } from '@chakra-ui/react'
import { Formik, Form, FormikHelpers } from 'formik'
import InputField from '../components/InputField'
import { CreatePostInput, useCreatePostMutation } from '../generated/graphql'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

const CreatePost = () => {
  // Router Next
  const router = useRouter()

  // GraphQL
  const [createPost, _] = useCreatePostMutation()

  // Formik
  const initialValues = { title: '', text: '' }
  const onCreatePostSubmit = async (
    values: CreatePostInput,
    { setErrors: _ }: FormikHelpers<CreatePostInput>
  ) => {
    const response = await createPost({
      variables: { createPostInput: values }
    })
    console.log('RESPONSE')
    console.log(response)
    router.push('/')
  }

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

export default CreatePost
