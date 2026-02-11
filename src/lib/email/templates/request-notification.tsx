interface RequestNotificationEmailProps {
  requestType: 'INFO' | 'ORDER'
  storeName: string
  storeBrand: string
  storeCity: string
  offerName: string
  message: string | null
  ctaUrl: string
}

export function RequestNotificationEmail({
  requestType,
  storeName,
  storeBrand,
  storeCity,
  offerName,
  message,
  ctaUrl,
}: RequestNotificationEmailProps) {
  const isOrder = requestType === 'ORDER'
  const heading = isOrder ? 'Intention de commande' : 'Nouvelle demande de renseignements'

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '24px', color: '#25224A' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
        {heading}
      </h1>
      <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' }}>
        <strong>{storeName}</strong> ({storeBrand} - {storeCity})
        {isOrder ? ' souhaite passer commande sur votre offre :' : ' vous a envoyé une demande de renseignements pour :'}
      </p>
      <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        {offerName}
      </p>
      {message && (
        <div style={{ backgroundColor: '#F5F5F5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px' }}>Message :</p>
          <p style={{ fontSize: '14px', margin: '0' }}>{message}</p>
        </div>
      )}
      <a
        href={ctaUrl}
        style={{
          display: 'inline-block',
          backgroundColor: '#3E50F7',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '0 8px 8px 8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '14px',
          marginTop: '8px',
        }}
      >
        Voir la demande
      </a>
      <hr style={{ border: 'none', borderTop: '1px solid #EEF2FE', margin: '24px 0 16px' }} />
      <p style={{ fontSize: '12px', color: '#999' }}>
        Cet email a été envoyé automatiquement par Aurelien.
      </p>
    </div>
  )
}
