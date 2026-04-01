export default function TextBlock({ content }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  )
}