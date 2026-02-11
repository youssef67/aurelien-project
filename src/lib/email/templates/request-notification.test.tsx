import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { RequestNotificationEmail } from './request-notification'

function defaultProps() {
  return {
    requestType: 'INFO' as const,
    storeName: 'Mon Magasin',
    storeBrand: 'Carrefour',
    storeCity: 'Paris',
    offerName: 'Promo Biscuits',
    message: 'Question sur les délais de livraison',
    ctaUrl: 'http://localhost:3000/requests/req-123',
  }
}

describe('RequestNotificationEmail', () => {
  describe('INFO request type', () => {
    it('renders heading "Nouvelle demande de renseignements"', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('Nouvelle demande de renseignements')
    })

    it('renders store info text with "a envoyé une demande de renseignements"', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('vous a envoyé une demande de renseignements pour')
    })
  })

  describe('ORDER request type', () => {
    it('renders heading "Intention de commande"', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} requestType="ORDER" />
      )

      expect(html).toContain('Intention de commande')
    })

    it('renders store info text with "souhaite passer commande"', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} requestType="ORDER" />
      )

      expect(html).toContain('souhaite passer commande sur votre offre')
    })
  })

  describe('store information', () => {
    it('renders store name', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('Mon Magasin')
    })

    it('renders store brand and city', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('Carrefour')
      expect(html).toContain('Paris')
    })
  })

  describe('offer information', () => {
    it('renders offer name', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('Promo Biscuits')
    })
  })

  describe('message section', () => {
    it('renders message when provided', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('Question sur les délais de livraison')
      expect(html).toContain('Message')
    })

    it('does not render message section when message is null', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} message={null} />
      )

      expect(html).not.toContain('Message')
    })
  })

  describe('CTA button', () => {
    it('renders CTA link with correct URL', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('href="http://localhost:3000/requests/req-123"')
    })

    it('renders CTA text "Voir la demande"', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('Voir la demande')
    })

    it('uses cobalt primary color for CTA button', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('#3E50F7')
    })
  })

  describe('footer', () => {
    it('renders footer text', () => {
      const html = renderToStaticMarkup(
        <RequestNotificationEmail {...defaultProps()} />
      )

      expect(html).toContain('Cet email a été envoyé automatiquement par Aurelien')
    })
  })
})
