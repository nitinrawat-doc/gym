import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { trainer, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',maxWidth:'430px',margin:'0 auto',position:'relative'}}>

      {/* Header */}
      <header style={{
        background:'rgba(0,0,0,0.6)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:50
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'34px',height:'34px',borderRadius:'10px',background:'linear-gradient(135deg,#00ff87,#0066ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',boxShadow:'0 0 16px rgba(0,255,135,0.25)'}}>💪</div>
          <div>
            <div style={{fontWeight:'800',fontSize:'13px',letterSpacing:'1px',background:'linear-gradient(135deg,#00ff87,#0066ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>TRUE FITNESS</div>
            <div style={{color:'rgba(255,255,255,0.35)',fontSize:'10px'}}>Hi, {trainer?.name?.split(' ')[0]}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          color:'rgba(255,255,255,0.4)',fontSize:'11px',
          border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',
          padding:'6px 12px',background:'rgba(255,255,255,0.05)',cursor:'pointer'
        }}>Logout</button>
      </header>

      {/* Content */}
      <main style={{flex:1,overflowY:'auto',paddingBottom:'90px',padding:'16px 16px 90px'}}>
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav style={{
        position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',
        width:'100%',maxWidth:'430px',
        background:'rgba(0,0,0,0.7)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',
        borderTop:'1px solid rgba(255,255,255,0.07)',
        display:'flex',zIndex:50
      }}>
        {[
          { to:'/', icon:'📊', label:'Dashboard', end:true },
          { to:'/members', icon:'👥', label:'Members', end:false }
        ].map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            padding:'10px 0 14px', gap:'3px', fontSize:'10px', textDecoration:'none',
            color: isActive ? 'transparent' : 'rgba(255,255,255,0.35)',
            background: isActive ? 'transparent' : 'transparent',
            backgroundImage: isActive ? 'linear-gradient(135deg,#00ff87,#0066ff)' : 'none',
            WebkitBackgroundClip: isActive ? 'text' : 'unset',
            WebkitTextFillColor: isActive ? 'transparent' : 'rgba(255,255,255,0.35)',
            fontWeight: isActive ? '600' : '400',
            transition:'all .2s'
          })}>
            <span style={{fontSize:'20px'}}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
