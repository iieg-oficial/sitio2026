import { SafeHtml } from '@components/SafeHtml';

export default function TextBlock({ content }) {
  return (
    <SafeHtml htmlContent={content} />
  )
}