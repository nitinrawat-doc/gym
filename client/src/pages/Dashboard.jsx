import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const glass = {
  background:'rgba(255,255,255,0.04)',
  backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
  border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:'20px', padding:'16px'
};

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px'}}>
      <div style={{background:'linear-gradient(135deg,#00ff87,#0066ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'14px',fontWeight:'600'}}>Loading...</div>
    </div>
  );

  if (!data) return (
    <div style={{color:'#ff6b6b',textAlign:'center',padding:'40px'}}>
      Failed to load data.
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
        <StatCard icon="👥" label="Total Members"     value={data.totalMembers}   gradient="blue"/>
        <StatCard icon="✅" label="Fees Up to Date"    value={data.activeMembers}  gradient="green"/>
        <StatCard icon="💰" label="Revenue This Month" value={`₹${data.monthlyRevenue.toLocaleString('en-IN')}`} gradient="yellow"/>
        <StatCard icon="⚠️" label="Pending / Overdue"  value={data.pendingMembers} gradient="red"/>
      </div>

      <div style={glass}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h2 style={{color:'white',fontWeight:'600',fontSize:'14px',margin:0}}>Monthly Revenue</h2>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data.monthlyData} barSize={24}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff87"/>
                <stop offset="100%" stopColor="#0066ff"/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis hide/>
            <Tooltip
              cursor={{fill:'rgba(255,255,255,0.04)'}}
              contentStyle={{background:'rgba(0,10,30,0.9)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',fontSize:12}}
              labelStyle={{color:'rgba(255,255,255,0.5)'}}
              formatter={v=>[`₹${v.toLocaleString('en-IN')}`,'Revenue']}
            />
            <Bar dataKey="revenue" radius={[6,6,0,0]}>
              {data.monthlyData.map((_,i)=>(
                <Cell key={i} fill={i===data.monthlyData.length-1?'url(#barGrad)':'rgba(255,255,255,0.08)'}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={glass}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
          <h2 style={{color:'white',fontWeight:'600',fontSize:'14px',margin:0}}>Recent Members</h2>
          <button
            onClick={()=>navigate('/members')}
            style={{
              border:'none',
              cursor:'pointer',
              fontSize:'12px',
              background:'linear-gradient(135deg,#00ff87,#0066ff)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              fontWeight:'600',
              padding:0
            }}
          >View all →</button>
        </div>
        {data.recentMembers.length===0 ? (
          <p style={{color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'20px 0',fontSize:'13px'}}>
            No members yet.
          </p>
        ) : data.recentMembers.map(m=>(
          <button key={m.id} onClick={()=>navigate(`/members/${m.id}`)} style={{
            width:'100%',display:'flex',alignItems:'center',gap:'12px',
            padding:'10px 8px',borderRadius:'12px',
            background:'transparent',border:'none',cursor:'pointer',
            textAlign:'left',marginBottom:'4px'
          }}>
            <div style={{
              width:'38px',height:'38px',borderRadius:'50%',flexShrink:0,
              background:'linear-gradient(135deg,rgba(0,255,135,0.2),rgba(0,102,255,0.2))',
              border:'1px solid rgba(255,255,255,0.1)',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'white',fontWeight:'700',fontSize:'12px'
            }}>
              {m.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:'white',fontSize:'13px',fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</div>
              <div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',textTransform:'capitalize'}}>{m.plan} · ₹{m.fee_amount}</div>
            </div>
            <StatusBadge status={m.status}/>
          </button>
        ))}
      </div>

    </div>
  );
}