import ComingSoon from '@/components/ComingSoon';
import { PAGE_CONFIG } from '@/lib/page-config';

const EventsPage = () => {
  // Check if events page is disabled
  if (PAGE_CONFIG.EVENTS_DISABLED) {
    return (
      <ComingSoon
        title="Events & Celebrations"
        message={PAGE_CONFIG.EVENTS_MESSAGE}
        backLink="/"
        backText="Back to Home"
      />
    );
  }

  // Original events page content would go here
  // For now, return a placeholder since the page is disabled
  return null;
};

export default EventsPage;