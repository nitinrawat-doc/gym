export default function StatusBadge({ status }) {
  const styles = {
    paid:    { bg:'rgba(0,255,135,0.12)', border:'rgba(0,255,135,0.3)', color:'#00ff87' },
    pending: { bg:'rgba(255,180,0,0.12)', border:'rgba(255,180,0,0.3)', color:'#fbbf24' },
    overdue: { bg:'rgba(255,60,60,0.12)', border:'rgba(255,60,60,0.3)', color:'#ff6b6b' }
  };
  const labels = { paid:'✅ Paid', pending:'⏳ Pending', overdue:'⚠️ Overdue' };
  const s = styles[status] || styles.pending;

  return (
    <span style={{
      background:s.bg, border:`1px solid ${s.border}`, color:s.color,
      fontSize:'11px', fontWeight:'600', padding:'4px 10px',
      borderRadius:'20px', whiteSpace:'nowrap',
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)'
    }}>
      {labels[status] || status}
    </span>
  );
}
