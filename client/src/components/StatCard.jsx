export default function StatCard({ icon, label, value, gradient }) {
  const gradients = {
    blue:   { bg:'rgba(0,102,255,0.12)', border:'rgba(0,102,255,0.25)', glow:'rgba(0,102,255,0.15)', text:'#60a5fa' },
    green:  { bg:'rgba(0,255,135,0.1)',  border:'rgba(0,255,135,0.2)',  glow:'rgba(0,255,135,0.12)', text:'#4ade80' },
    yellow: { bg:'rgba(255,180,0,0.1)',  border:'rgba(255,180,0,0.2)',  glow:'rgba(255,180,0,0.12)', text:'#fbbf24' },
    red:    { bg:'rgba(255,60,60,0.1)',   border:'rgba(255,60,60,0.2)',  glow:'rgba(255,60,60,0.12)', text:'#f87171' }
  };
  const c = gradients[gradient] || gradients.blue;

  return (
    <div style={{
      background:c.bg, border:`1px solid ${c.border}`,
      borderRadius:'16px', padding:'16px',
      boxShadow:`0 0 20px ${c.glow}`,
      backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)'
    }}>
      <div style={{fontSize:'22px',marginBottom:'8px'}}>{icon}</div>
      <div style={{fontSize:'22px',fontWeight:'700',color:'white',lineHeight:1}}>{value}</div>
      <div style={{fontSize:'11px',color:c.text,marginTop:'4px',fontWeight:'500'}}>{label}</div>
    </div>
  );
}
