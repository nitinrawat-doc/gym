import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PLANS = [
  { value:'monthly',   label:'Monthly',   desc:'Every month' },
  { value:'quarterly', label:'Quarterly', desc:'Every 3 months' },
  { value:'yearly',    label:'Yearly',    desc:'Every year' }
];

const inp = {
  width:'100%', padding:'14px 16px', fontSize:'14px', boxSizing:'border-box',
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:'14px', color:'white', outline:'none', marginBottom:'14px'
};

export default function AddMember() {
  const navigate = useNavigate();
  const today    = new Date().toISOString().split('T')[0];
  const [form, setForm]       = useState({ name:'', phone:'', plan:'monthly', fee_amount:'', joining_date:today });
  const [feeStatus, setFeeStatus] = useState('pending'); // ✅ Fee status
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function set(f, v) { setForm(p => ({...p,[f]:v})); }

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    if (!form.name.trim())  return setError('Name is required.');
    if (!form.phone.trim()) return setError('Phone is required.');
    if (!form.fee_amount)   return setError('Fee amount is required.');
    setLoading(true);
    try {
      // Step 1: Member banao (pending status ke saath)
      const res = await api.post('/members', form);
      const memberId = res.data._id || res.data.id;

      // Step 2: Agar fee paid hai toh payment record banao
      if (feeStatus === 'paid') {
        await api.post(`/payments/${memberId}`);
      }

      navigate('/members');
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
        <button onClick={() => navigate('/members')} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:'20px',padding:0}}>←</button>
        <h1 style={{color:'white',fontWeight:'700',fontSize:'22px',margin:0}}>Add Member</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{background:'rgba(255,60,60,0.1)',border:'1px solid rgba(255,60,60,0.25)',color:'#ff6b6b',fontSize:'13px',padding:'12px 16px',borderRadius:'14px',marginBottom:'16px'}}>
            {error}
          </div>
        )}

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Full Name *</label>
        <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Arjun Kumar" required style={inp}
          onFocus={e=>e.target.style.borderColor='rgba(0,255,135,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Phone Number *</label>
        <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" required style={inp}
          onFocus={e=>e.target.style.borderColor='rgba(0,255,135,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'8px'}}>Membership Plan *</label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'14px'}}>
          {PLANS.map(p=>(
            <button type="button" key={p.value} onClick={()=>set('plan',p.value)} style={{
              padding:'12px 6px', borderRadius:'14px', textAlign:'center', cursor:'pointer',
              background:form.plan===p.value?'linear-gradient(135deg,rgba(0,192,106,0.3),rgba(0,102,255,0.3))':'rgba(255,255,255,0.05)',
              border:form.plan===p.value?'1px solid rgba(0,255,135,0.4)':'1px solid rgba(255,255,255,0.1)',
              boxShadow:form.plan===p.value?'0 0 16px rgba(0,255,135,0.15)':'none'
            }}>
              <div style={{fontWeight:'700',fontSize:'12px',color:'white'}}>{p.label}</div>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginTop:'3px'}}>{p.desc}</div>
            </button>
          ))}
        </div>

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Fee Amount (₹) *</label>
        <input type="number" value={form.fee_amount} onChange={e=>set('fee_amount',e.target.value)} placeholder="1500" required min="1" style={inp}
          onFocus={e=>e.target.style.borderColor='rgba(0,255,135,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>

        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Joining Date *</label>
        <input type="date" value={form.joining_date} onChange={e=>set('joining_date',e.target.value)} required style={{...inp,marginBottom:'18px'}}
          onFocus={e=>e.target.style.borderColor='rgba(0,255,135,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>

        {/* ✅ Fee Status Section */}
        <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'8px'}}>Fee Status *</label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
          <button type="button" onClick={()=>setFeeStatus('pending')} style={{
            padding:'14px', borderRadius:'14px', textAlign:'center', cursor:'pointer',
            background:feeStatus==='pending'?'rgba(255,180,0,0.15)':'rgba(255,255,255,0.05)',
            border:feeStatus==='pending'?'1px solid rgba(255,180,0,0.5)':'1px solid rgba(255,255,255,0.1)',
            boxShadow:feeStatus==='pending'?'0 0 16px rgba(255,180,0,0.15)':'none'
          }}>
            <div style={{fontSize:'20px',marginBottom:'4px'}}>⏳</div>
            <div style={{fontWeight:'700',fontSize:'13px',color:feeStatus==='pending'?'#fbbf24':'white'}}>Fee Pending</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginTop:'3px'}}>Abhi tak fee nahi aayi</div>
          </button>

          <button type="button" onClick={()=>setFeeStatus('paid')} style={{
            padding:'14px', borderRadius:'14px', textAlign:'center', cursor:'pointer',
            background:feeStatus==='paid'?'rgba(0,255,135,0.12)':'rgba(255,255,255,0.05)',
            border:feeStatus==='paid'?'1px solid rgba(0,255,135,0.4)':'1px solid rgba(255,255,255,0.1)',
            boxShadow:feeStatus==='paid'?'0 0 16px rgba(0,255,135,0.15)':'none'
          }}>
            <div style={{fontSize:'20px',marginBottom:'4px'}}>✅</div>
            <div style={{fontWeight:'700',fontSize:'13px',color:feeStatus==='paid'?'#00ff87':'white'}}>Fee Paid</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginTop:'3px'}}>Member ne fee de di</div>
          </button>
        </div>

        <button type="submit" disabled={loading} style={{
          width:'100%', padding:'16px', border:'none', borderRadius:'16px',
          background:loading?'rgba(255,255,255,0.08)':'linear-gradient(135deg,#00c06a,#0066ff)',
          color:'white', fontWeight:'700', fontSize:'15px',
          cursor:loading?'not-allowed':'pointer',
          boxShadow:loading?'none':'0 0 30px rgba(0,255,135,0.2)'
        }}>
          {loading ? 'Adding...' : '✅ Add Member'}
        </button>
      </form>
    </div>
  );
}
