export function ToolLinks({
  heading,
  links,
}: {
  heading: string;
  links: readonly { id: string; href: string; label: string }[];
}) {
  return (
    <div data-testid="more-tools">
      <p id="more-tools-heading" className="text-fg">
        {heading}
      </p>
      <nav className="mt-1 flex flex-wrap gap-x-4 gap-y-1" aria-labelledby="more-tools-heading">
        {links.map((link) => (
          <a key={link.id} href={link.href} className="text-steel underline-offset-4 hover:underline">
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
