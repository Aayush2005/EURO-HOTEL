import Link from 'next/link';

const POLICIES = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/cancellation-policy', label: 'Cancellation & Refund' },
];

/** Cross-links the three policy pages. `current` is the href of the page rendering it. */
const PolicyNav = ({ current }: { current: string }) => (
  <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm border-t border-muted-beige pt-6 mt-12">
    {POLICIES.map(({ href, label }) =>
      href === current ? (
        <span key={href} className="text-charcoal-500" aria-current="page">{label}</span>
      ) : (
        <Link key={href} href={href} className="text-gold-600 hover:underline">{label}</Link>
      )
    )}
  </nav>
);

export default PolicyNav;
