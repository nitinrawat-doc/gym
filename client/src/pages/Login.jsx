import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, { name: res.data.name, email: res.data.email });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width:'100%', padding:'14px 16px', fontSize:'14px',
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:'12px', color:'white', outline:'none', boxSizing:'border-box'
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:'24px',
      background:'radial-gradient(ellipse at top, #001a0e 0%, #000510 40%, #000000 100%)'
    }}>
      <div style={{position:'fixed',top:'-80px',left:'-80px',width:'300px',height:'300px',background:'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'fixed',bottom:'-80px',right:'-80px',width:'300px',height:'300px',background:'radial-gradient(circle, rgba(0,102,255,0.08) 0%, transparent 70%)',pointerEvents:'none'}}/>

      <div style={{textAlign:'center', marginBottom:'32px'}}>
        <div style={{width:'72px',height:'72px',borderRadius:'20px',margin:'0 auto 16px',background:'linear-gradient(135deg,#00ff87,#0066ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px',boxShadow:'0 0 40px rgba(0,255,135,0.3)'}}>💪</div>
        <h1 style={{fontSize:'28px',fontWeight:'800',letterSpacing:'2px',background:'linear-gradient(135deg,#00ff87,#0066ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:0}}>TRUE FITNESS</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginTop:'6px'}}>Gym Management System</p>
      </div>

      <form onSubmit={handleSubmit} style={{
        width:'100%',maxWidth:'360px',
        background:'rgba(255,255,255,0.05)',backdropFilter:'blur(30px)',WebkitBackdropFilter:'blur(30px)',
        border:'1px solid rgba(255,255,255,0.1)',borderRadius:'24px',padding:'28px',
        boxShadow:'0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
      }}>
        <h2 style={{color:'white',fontWeight:'600',fontSize:'18px',marginBottom:'20px',marginTop:0}}>Trainer Login</h2>
        {error && <div style={{background:'rgba(255,50,50,0.12)',border:'1px solid rgba(255,50,50,0.25)',color:'#ff8080',fontSize:'13px',padding:'12px 16px',borderRadius:'12px',marginBottom:'16px'}}>{error}</div>}
        <div style={{marginBottom:'14px'}}>
          <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="trainer@truefitness.com" required style={inputStyle}
            onFocus={e=>{e.target.style.borderColor='rgba(0,255,135,0.4)';e.target.style.background='rgba(0,255,135,0.05)'}}
            onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.background='rgba(255,255,255,0.06)'}}/>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',display:'block',marginBottom:'6px'}}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
            onFocus={e=>{e.target.style.borderColor='rgba(0,102,255,0.4)';e.target.style.background='rgba(0,102,255,0.05)'}}
            onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.background='rgba(255,255,255,0.06)'}}/>
        </div>
        <button type="submit" disabled={loading} style={{
          width:'100%',padding:'15px',
          background:loading?'rgba(255,255,255,0.08)':'linear-gradient(135deg,#00c06a,#0066ff)',
          border:'none',borderRadius:'14px',color:'white',fontWeight:'700',fontSize:'15px',
          cursor:loading?'not-allowed':'pointer',
          boxShadow:loading?'none':'0 0 30px rgba(0,255,135,0.2)',transition:'all .2s'
        }}>{loading?'Signing in...':'Sign In →'}</button>
      </form>
      <p style={{color:'rgba(255,255,255,0.18)',fontSize:'11px',marginTop:'16px'}}>trainer@truefitness.com / trainer123</p>
    </div>
  );
}
