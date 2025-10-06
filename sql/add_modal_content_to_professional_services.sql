-- Add modal content fields to professional_services table
-- This migration adds fields needed for detailed service modal popups

ALTER TABLE professional_services
ADD COLUMN full_description TEXT,
ADD COLUMN benefits JSON,
ADD COLUMN pricing VARCHAR(100),
ADD COLUMN timeline VARCHAR(100),
ADD COLUMN link_url VARCHAR(255),
ADD COLUMN link_text VARCHAR(100);

-- Update existing records with modal content
UPDATE professional_services
SET
    full_description = 'Establish sophisticated trust structures for asset protection, wealth preservation, and succession planning. Our trust formation services provide maximum protection for your assets while ensuring compliance with international regulations.',
    benefits = JSON_ARRAY('Maximum asset protection', 'Estate planning advantages', 'Tax efficiency', 'Succession planning', 'Privacy and confidentiality', 'Flexible beneficiary arrangements'),
    pricing = 'Starting from £2,500',
    timeline = '2-4 weeks',
    link_url = '/services#trusts',
    link_text = 'Explore Trusts'
WHERE id = 'trusts';

UPDATE professional_services
SET
    full_description = 'Professional nominee directors and shareholders provide enhanced privacy and regulatory compliance for your offshore company. Our vetted professionals ensure your business maintains full compliance while protecting your personal privacy.',
    benefits = JSON_ARRAY('Enhanced privacy protection', 'Regulatory compliance', 'Professional credibility', 'Reduced personal liability', 'Confidential ownership', 'Expert guidance'),
    pricing = 'Starting from £1,200',
    timeline = '1-2 weeks',
    link_url = '/services#nominees',
    link_text = 'View Details'
WHERE id = 'nominees';

UPDATE professional_services
SET
    full_description = 'Establish a professional business presence worldwide with our comprehensive virtual office solutions. Access prestigious business addresses, professional call handling, and administrative support without the overhead of physical offices.',
    benefits = JSON_ARRAY('Professional business address', 'Cost-effective solution', 'Global presence', 'Administrative support', 'Enhanced credibility', 'Flexible packages'),
    pricing = 'Starting from £150/month',
    timeline = 'Immediate setup',
    link_url = '/services#virtual-office',
    link_text = 'Get Started'
WHERE id = 'virtual-office';

UPDATE professional_services
SET
    full_description = 'Maintain ongoing compliance and optimize your tax position with our comprehensive support services. Our experts ensure your offshore entities remain in good standing while maximizing tax efficiency.',
    benefits = JSON_ARRAY('Regulatory compliance', 'Tax optimization', 'Risk mitigation', 'Expert guidance', 'Peace of mind', 'Cost savings'),
    pricing = 'Starting from £500/year',
    timeline = 'Ongoing support',
    link_url = '/services#compliance',
    link_text = 'Learn More'
WHERE id = 'compliance';

UPDATE professional_services
SET
    full_description = 'Obtain specialized financial services licenses for investment management, forex trading, banking, and insurance activities. Our regulatory experts guide you through complex licensing processes.',
    benefits = JSON_ARRAY('Regulatory compliance', 'Business expansion', 'Competitive advantage', 'Expert guidance', 'Global reach', 'Professional credibility'),
    pricing = 'Starting from £15,000',
    timeline = '3-6 months',
    link_url = '/services#licensing',
    link_text = 'Learn More'
WHERE id = 'licensing';

UPDATE professional_services
SET
    full_description = 'Secure investment-based residency and citizenship programs for international mobility and freedom. Access some of the world`s most prestigious passport programs and residency schemes.',
    benefits = JSON_ARRAY('Global mobility', 'Investment opportunities', 'Tax advantages', 'Family inclusion', 'Lifestyle benefits', 'Business opportunities'),
    pricing = 'Starting from £100,000',
    timeline = '6-18 months',
    link_url = '/services#immigration',
    link_text = 'Learn More'
WHERE id = 'immigration';