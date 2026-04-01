export default function HeroBlock({ title, subtitle, image_url }) {
  return (
    <section className="hero">
      <img src={image_url} alt={title} />
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  )
}
