import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

const glass = { background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'16px',marginBottom:'12px' };

function Row({ label, value, highlight }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
      <span style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>{label}</span>
      <span style={{fontSize:'13px',fontWeight:'600',color:highlight?'#ff6b6b':'white'}}>{value}</span>
    </div>
  );
}

export default function MemberDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [member, setMember]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg]   = useState('');
  const [error, setError] = useState('');

  async function fetchMember() {
    try { const res = await api.get(`/members/${id}`); setMember(res.data); }
    catch { setError('Member not found.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchMember(); }, [id]);

  async function handleMarkPaid() {
    if (!window.confirm(`Mark ₹${member.fee_amount} as paid for ${member.name}?`)) return;
    setPaying(true); setMsg('');
    try { const res = await api.post(`/payments/${id}`); setMsg(res.data.message); fetchMember(); }
    catch(e) { setError(e.response?.data?.error || 'Failed.'); }
    finally { setPaying(false); }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove ${member.name} from the gym?`)) return;
    setDeleting(true);
    try { await api.delete(`/members/${id}`); navigate('/members'); }
    catch { setError('Failed to remove member.'); setDeleting(false); }
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px',background:'linear-gradient(135deg,#00ff87,#0066ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'14px'}}>Loading...</div>;
  if (error && !member) return <div style={{color:'#ff6b6b',textAlign:'center',padding:'40px'}}>{error}</div>;

  const initials = member.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
      <button onClick={() => navigate('/members')} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:'13px',textAlign:'left',marginBottom:'8px',padding:0}}>← Back to members</button>

      {/* Profile */}
      <div style={{...glass,textAlign:'center',padding:'24px 16px'}}>
        <div style={{width:'64px',height:'64px',borderRadius:'50%',margin:'0 auto 12px',background:'linear-gradient(135deg,#00ff87,#0066ff)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'700',fontSize:'20px',boxShadow:'0 0 30px rgba(0,255,135,0.25)'}}>
          {initials}
        </div>
        <h2 style={{color:'white',fontWeight:'700',fontSize:'20px',margin:'0 0 4px'}}>{member.name}</h2>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:'0 0 12px'}}>{member.phone}</p>
        <StatusBadge status={member.status}/>
      </div>

      {/* Details */}
      <div style={glass}>
        <Row label="Plan"      value={<span style={{textTransform:'capitalize'}}>{member.plan}</span>}/>
        <Row label="Fee"       value={`₹${member.fee_amount.toLocaleString('en-IN')}`}/>
        <Row label="Joined"    value={member.joining_date}/>
        <Row label="Next Due"  value={member.next_due_date} highlight={member.status!=='paid'}/>
      </div>

      {msg && <div style={{background:'rgba(0,255,135,0.1)',border:'1px solid rgba(0,255,135,0.25)',color:'#00ff87',fontSize:'13px',padding:'12px 16px',borderRadius:'14px',marginBottom:'8px'}}>{msg}</div>}
      {error && <div style={{background:'rgba(255,60,60,0.1)',border:'1px solid rgba(255,60,60,0.25)',color:'#ff6b6b',fontSize:'13px',padding:'12px 16px',borderRadius:'14px',marginBottom:'8px'}}>{error}</div>}

      {/* Actions */}
      <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'4px'}}>
        {member.status !== 'paid' && (
          <button onClick={handleMarkPaid} disabled={paying} style={{
            width:'100%',padding:'16px',border:'none',borderRadius:'16px',cursor:paying?'not-allowed':'pointer',
            background:'linear-gradient(135deg,#00c06a,#00a855)',color:'white',fontWeight:'700',fontSize:'15px',
            boxShadow:'0 0 30px rgba(0,255,135,0.25)',opacity:paying?0.6:1,transition:'all .2s'
          }}>
            {paying ? 'Processing...' : `💳 Mark Fee as Paid — ₹${member.fee_amount.toLocaleString('en-IN')}`}
          </button>
        )}
        <button onClick={() => navigate(`/members/${id}/edit`)} style={{
          width:'100%',padding:'14px',borderRadius:'16px',cursor:'pointer',
          background:'rgba(0,102,255,0.12)',border:'1px solid rgba(0,102,255,0.25)',
          color:'#60a5fa',fontWeight:'600',fontSize:'14px',transition:'all .2s'
        }}>✏️ Edit Member</button>
        <button onClick={handleDelete} disabled={deleting} style={{
          width:'100%',padding:'14px',borderRadius:'16px',cursor:deleting?'not-allowed':'pointer',
          background:'rgba(255,60,60,0.08)',border:'1px solid rgba(255,60,60,0.2)',
          color:'#ff6b6b',fontWeight:'600',fontSize:'13px',opacity:deleting?0.6:1
        }}>{deleting?'Removing...':'🗑️ Remove from Gym'}</button>
      </div>

      {/* Payment History */}
      <div style={glass}>
        <h3 style={{color:'white',fontWeight:'600',fontSize:'14px',margin:'0 0 12px'}}>Payment History</h3>
        {!member.payments || member.payments.length === 0 ? (
          <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px',textAlign:'center',padding:'16px 0'}}>No payments yet.</p>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
            {member.payments.map(p => (
              <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{color:'white',fontSize:'13px',fontWeight:'600'}}>₹{p.amount.toLocaleString('en-IN')}</div>
                  <div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',marginTop:'2px'}}>Paid on {p.paid_date}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)'}}>Valid till</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)'}}>{p.period_end}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
