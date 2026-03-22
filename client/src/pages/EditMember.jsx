import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const PLANS = ['monthly','quarterly','yearly'];
const inputStyle = {
  width:'100%', padding:'14px 16px', fontSize:'14px', boxSizing:'border-box',
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:'14px', color:'white', outline:'none', marginBottom:'14px',
  backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)'
};

export default function EditMember() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name:'', phone:'', plan:'monthly', fee_amount:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get(`/members/${id}`)
      .then(r => setForm({ name:r.data.name, phone:r.data.phone, plan:r.data.plan, fee_amount:r.data.fee_amount }))
      .catch(() => setError('Member not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  function set(field, value) { setForm(prev => ({...prev,[field]:value})); }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSaving(true);
    try { await api.put(`/members/${id}`, form); navigate(`/members/${id}`); }
    catch(err) { setError(err.response?.data?.error || 'Failed to update.'); }
    finally { setSaving(false); }
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px',background:'linear-gradient(135deg,#00ff87,#0066ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'14px'}}>Loading...</div>;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
        <button onClick={() => navigate(-1)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:'20px',padding:0,lineHeight:1}}>←</button>
        <h1 style={{color:'white',fontWeight:'700',fontSize:'22px',margin:0}}>Edit Member</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div style={{background:'rgba(255,60,60,0.1)',border:'1px solid rgba(255,60,60,0.25)',color:'#ff6b6b',fontSize:'13px',padding:'12px 16px',borderRadius:'14px',marginBottom:'16px'}}>{error}</div>}

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Full Name</label>
        <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} required style={inputStyle}
          onFocus={e=>e.target.style.borderColor='rgba(0,255,135,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Phone Number</label>
        <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} required style={inputStyle}
          onFocus={e=>e.target.style.borderColor='rgba(0,255,135,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'8px'}}>Membership Plan</label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'14px'}}>
          {PLANS.map(p => (
            <button type="button" key={p} onClick={() => set('plan',p)} style={{
              padding:'12px 6px', borderRadius:'14px', textAlign:'center', cursor:'pointer',
              textTransform:'capitalize', fontWeight:'700', fontSize:'12px', color:'white', transition:'all .15s',
              background: form.plan===p ? 'linear-gradient(135deg,rgba(0,192,106,0.3),rgba(0,102,255,0.3))' : 'rgba(255,255,255,0.05)',
              border: form.plan===p ? '1px solid rgba(0,255,135,0.4)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: form.plan===p ? '0 0 16px rgba(0,255,135,0.15)' : 'none'
            }}>{p}</button>
          ))}
        </div>

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Fee Amount (₹)</label>
        <input type="number" value={form.fee_amount} onChange={e=>set('fee_amount',e.target.value)} required min="1" style={{...inputStyle,marginBottom:'20px'}}
          onFocus={e=>e.target.style.borderColor='rgba(0,255,135,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>

        <button type="submit" disabled={saving} style={{
          width:'100%', padding:'16px', border:'none', borderRadius:'16px',
          background: saving ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#00c06a,#0066ff)',
          color:'white', fontWeight:'700', fontSize:'15px',
          cursor:saving?'not-allowed':'pointer',
          boxShadow: saving ? 'none' : '0 0 30px rgba(0,255,135,0.2)'
        }}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
      </form>
    </div>
  );
}
