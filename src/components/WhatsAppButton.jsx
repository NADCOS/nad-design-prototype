import React from 'react';

const WHATSAPP_PHONE = '966534581911'; // temporary receiver number — replace with the real business number

export default function WhatsAppButton() {
  const [hover, setHover] = React.useState(false);
  const link = 'https://wa.me/' + WHATSAPP_PHONE.replace(/[^0-9]/g, '');
  return (
    <a href={link} target="_blank" rel="noreferrer" aria-label="Chat with NAD Design on WhatsApp">
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'fixed', bottom: 26, right: 26, width: 58, height: 58, borderRadius: '50%', background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hover ? '0 12px 26px oklch(20% 0.02 50 / 0.45)' : '0 8px 20px oklch(20% 0.02 50 / 0.35)',
          zIndex: 200, transform: hover ? 'scale(1.08)' : 'scale(1)', transition: 'transform .18s ease,box-shadow .18s ease',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 32 32" fill="white" aria-hidden="true"><path d="M16.004 3C9.06 3 3.43 8.63 3.43 15.573c0 2.31.62 4.474 1.7 6.34L3 29l7.27-2.08a12.5 12.5 0 0 0 5.73 1.4h.005c6.943 0 12.573-5.63 12.573-12.574C28.578 8.803 22.948 3 16.004 3zm0 22.86h-.004a10.4 10.4 0 0 1-5.3-1.45l-.38-.226-3.94 1.128 1.05-3.84-.246-.394a10.36 10.36 0 0 1-1.586-5.505c0-5.732 4.665-10.395 10.41-10.395 2.78 0 5.39 1.083 7.353 3.048a10.33 10.33 0 0 1 3.05 7.35c0 5.733-4.665 10.284-10.407 10.284zm5.702-7.723c-.312-.157-1.848-.912-2.134-1.016-.286-.104-.494-.157-.702.157-.208.313-.807 1.016-.99 1.225-.182.208-.364.234-.676.078-.313-.157-1.32-.487-2.514-1.552-.93-.83-1.558-1.854-1.74-2.166-.182-.313-.02-.482.137-.638.14-.14.313-.365.47-.547.157-.183.208-.313.312-.522.104-.208.052-.39-.026-.547-.078-.157-.702-1.694-.963-2.32-.254-.61-.51-.527-.702-.537l-.598-.01c-.208 0-.547.078-.833.39-.286.313-1.09 1.066-1.09 2.6 0 1.535 1.116 3.017 1.272 3.226.156.208 2.198 3.356 5.326 4.706.744.32 1.325.512 1.778.656.747.238 1.427.204 1.965.124.6-.09 1.848-.756 2.108-1.486.26-.73.26-1.355.182-1.486-.078-.13-.286-.208-.598-.365z" /></svg>
      </div>
    </a>
  );
}
