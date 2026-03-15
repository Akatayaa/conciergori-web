import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PrintLivretPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params
  const { data: p } = await supabase
    .from('properties')
    .select('name, address, cover_image, welcome_message, wifi_name, wifi_password, checkin_instructions, checkout_instructions, house_rules, local_tips, emergency_contact')
    .eq('id', propertyId)
    .single()

  if (!p) return notFound()

  const Section = ({ icon, title, content }: { icon: string; title: string; content?: string | null }) => {
    if (!content) return null
    return (
      <div style={{ marginBottom: '28px', breakInside: 'avoid' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#00243f', borderBottom: '2px solid #0097b2', paddingBottom: '6px', marginBottom: '10px' }}>
          {icon} {title}
        </h2>
        <p style={{ fontSize: '13px', lineHeight: '1.8', whiteSpace: 'pre-line', color: '#333' }}>{content}</p>
      </div>
    )
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Livret d&apos;accueil — {p.name}</title>
        <style>{`
          @page { size: A4; margin: 20mm; }
          @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; } }
          * { box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; background: white; margin: 0; padding: 32px; }
        `}</style>
      </head>
      <body>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '3px solid #00243f' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 'bold', color: '#00243f' }}>
              Concierg&apos;ori
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Conciergerie · Caen, Normandie</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'bold', color: '#0097b2' }}>
              Livret d&apos;accueil
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{p.name}</div>
            {p.address && <div style={{ fontSize: '11px', color: '#888' }}>{p.address}</div>}
          </div>
        </div>

        {/* Bienvenue */}
        {p.welcome_message && (
          <div style={{ backgroundColor: '#e6f7fa', borderLeft: '4px solid #0097b2', padding: '16px 20px', borderRadius: '8px', marginBottom: '28px' }}>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#00243f', margin: 0, whiteSpace: 'pre-line' }}>{p.welcome_message}</p>
          </div>
        )}

        {/* WiFi encadré */}
        {p.wifi_name && (
          <div style={{ backgroundColor: '#fff2e0', border: '2px solid #e8d8c0', borderRadius: '10px', padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Réseau WiFi</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00243f', marginTop: '4px' }}>{p.wifi_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Mot de passe</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0097b2', marginTop: '4px', fontFamily: 'monospace' }}>{p.wifi_password}</div>
            </div>
          </div>
        )}

        {/* Sections */}
        <Section icon="🔓" title="Arrivée" content={p.checkin_instructions} />
        <Section icon="🔒" title="Départ" content={p.checkout_instructions} />
        <Section icon="📜" title="Règlement intérieur" content={p.house_rules} />
        <Section icon="🗺️" title="Bons plans & recommandations" content={p.local_tips} />
        <Section icon="🆘" title="Contacts d'urgence" content={p.emergency_contact} />

        {/* Footer */}
        <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e8d8c0', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa' }}>
          <span>Concierg&apos;ori · contact@conciergori.fr</span>
          <span>{p.name}</span>
        </div>

        {/* Bouton imprimer (masqué à l'impression) */}
        <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px' }}>
          <button onClick={() => window.print()} style={{
            backgroundColor: '#0097b2', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            🖨️ Imprimer
          </button>
        </div>
      </body>
    </html>
  )
}
