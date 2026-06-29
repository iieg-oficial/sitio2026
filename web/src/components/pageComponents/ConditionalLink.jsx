import TrackedLink from '@components/blocks/boton'

const ConditionalLink = ({ link, children, ...props }) =>
  link ? (
    <TrackedLink to={link} {...props}>{children}</TrackedLink>
  ) : (
    <>{children}</>
  );

export default ConditionalLink