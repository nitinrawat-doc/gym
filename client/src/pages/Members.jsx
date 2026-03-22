import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

const glass = { background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'16px' };
const FILTERS = ['all','paid','pending','overdue'];

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filter !== 'all') params.status = filter;
      const res = await api.get('/members', { params });
      setMembers(res.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { const t = setTimeout(fetchMembers, 300); return () => clearTimeout(t); }, [fetchMembers]);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{color:'white',fontWeight:'700',fontSize:'22px',margin:0}}>Members</h1>
        <button onClick={() => navigate('/members/add')} style={{
          background:'linear-gradient(135deg,#00c06a,#0066ff)', border:'none',
          color:'white', fontWeight:'700', fontSize:'13px', padding:'10px 18px',
          borderRadius:'14px', cursor:'pointer', boxShadow:'0 0 20px rgba(0,255,135,0.2)'
        }}>+ Add</button>
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Search by name or phone..."
        style={{
          width:'100%', padding:'14px 16px', fontSize:'14px', boxSizing:'border-box',
          background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:'14px', color:'white', outline:'none',
          backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)'
        }}
        onFocus={e => e.target.style.borderColor='rgba(0,255,135,0.35)'}
        onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
      />

      {/* Filters */}
      <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'4px'}}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flexShrink:0, textTransform:'capitalize', fontSize:'12px', fontWeight:'600',
            padding:'7px 16px', borderRadius:'20px', cursor:'pointer', transition:'all .15s',
            background: filter===f ? 'linear-gradient(135deg,#00c06a,#0066ff)' : 'rgba(255,255,255,0.05)',
            border: filter===f ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: filter===f ? 'white' : 'rgba(255,255,255,0.4)',
            boxShadow: filter===f ? '0 0 16px rgba(0,255,135,0.2)' : 'none'
          }}>{f}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{textAlign:'center',padding:'40px',background:'linear-gradient(135deg,#00ff87,#0066ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'14px'}}>Loading...</div>
      ) : members.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'40px',marginBottom:'12px'}}>🏋️</div>
          <p style={{color:'rgba(255,255,255,0.3)',fontSize:'14px'}}>No members found.</p>
          <button onClick={() => navigate('/members/add')} style={{marginTop:'12px',background:'none',border:'none',cursor:'pointer',fontSize:'13px',background:'linear-gradient(135deg,#00ff87,#0066ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:'600'}}>Add your first member</button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {members.map(m => (
            <button key={m.id} onClick={() => navigate(`/members/${m.id}`)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:'12px',
              padding:'14px 16px', borderRadius:'16px', cursor:'pointer', textAlign:'left',
              background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.07)',
              transition:'all .15s', boxSizing:'border-box'
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
              <div style={{width:'42px',height:'42px',borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,rgba(0,255,135,0.15),rgba(0,102,255,0.15))',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'700',fontSize:'13px'}}>
                {m.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:'white',fontWeight:'600',fontSize:'14px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</div>
                <div style={{color:'rgba(255,255,255,0.35)',fontSize:'11px',marginTop:'2px'}}>{m.phone}</div>
                <div style={{color:'rgba(255,255,255,0.25)',fontSize:'11px',textTransform:'capitalize',marginTop:'1px'}}>{m.plan} · ₹{m.fee_amount.toLocaleString('en-IN')}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px',flexShrink:0}}>
                <StatusBadge status={m.status}/>
                <span style={{color:'rgba(255,255,255,0.25)',fontSize:'10px'}}>Due {m.next_due_date}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
