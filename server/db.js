const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'truefitness.json');

function load() {
  if (!fs.existsSync(DB_PATH)) return { trainers: [], members: [], payments: [] };
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { trainers: [], members: [], payments: [] }; }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map(x => x.id)) + 1;
}

function calcNextDueDate(fromDate, plan) {
  const d = new Date(fromDate);
  if (plan === 'monthly')   d.setMonth(d.getMonth() + 1);
  if (plan === 'quarterly') d.setMonth(d.getMonth() + 3);
  if (plan === 'yearly')    d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

function computeStatus(nextDueDate) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(nextDueDate);
  if (due < today) return 'overdue';
  const daysLeft = (due - today) / (1000 * 60 * 60 * 24);
  if (daysLeft <= 7) return 'pending';
  return 'paid';
}

function findTrainerByEmail(email) {
  return load().trainers.find(t => t.email === email.toLowerCase().trim()) || null;
}

function getMembers(trainerId, { search, status } = {}) {
  let list = load().members.filter(m => m.trainer_id === trainerId && m.active);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(m => m.name.toLowerCase().includes(s) || m.phone.includes(s));
  }
  list = list.map(m => ({ ...m, status: computeStatus(m.next_due_date) }));
  if (status && status !== 'all') list = list.filter(m => m.status === status);
  return list.reverse();
}

function getMemberById(id, trainerId) {
  const db = load();
  const m  = db.members.find(m => m.id === Number(id) && m.trainer_id === trainerId && m.active);
  if (!m) return null;
  const payments = db.payments.filter(p => p.member_id === m.id).reverse();
  return { ...m, status: computeStatus(m.next_due_date), payments };
}

function createMember(trainerId, data) {
  const db = load();
  const member = {
    id:            nextId(db.members),
    trainer_id:    trainerId,
    name:          data.name.trim(),
    phone:         data.phone.trim(),
    plan:          data.plan,
    fee_amount:    Number(data.fee_amount),
    joining_date:  data.joining_date,
    next_due_date: calcNextDueDate(data.joining_date, data.plan),
    active:        true,
    created_at:    new Date().toISOString()
  };
  db.members.push(member);
  save(db);
  return { ...member, status: computeStatus(member.next_due_date) };
}

function updateMember(id, trainerId, data) {
  const db  = load();
  const idx = db.members.findIndex(m => m.id === Number(id) && m.trainer_id === trainerId && m.active);
  if (idx === -1) return null;
  const old  = db.members[idx];
  const plan = data.plan || old.plan;
  const next_due_date = plan !== old.plan ? calcNextDueDate(old.joining_date, plan) : old.next_due_date;
  db.members[idx] = {
    ...old,
    name:          data.name        || old.name,
    phone:         data.phone       || old.phone,
    plan,
    fee_amount:    data.fee_amount != null ? Number(data.fee_amount) : old.fee_amount,
    next_due_date
  };
  save(db);
  return { ...db.members[idx], status: computeStatus(db.members[idx].next_due_date) };
}

function deleteMember(id, trainerId) {
  const db  = load();
  const idx = db.members.findIndex(m => m.id === Number(id) && m.trainer_id === trainerId && m.active);
  if (idx === -1) return false;
  db.members[idx].active = false;
  save(db);
  return true;
}

function markPaid(memberId, trainerId) {
  const db  = load();
  const idx = db.members.findIndex(m => m.id === Number(memberId) && m.trainer_id === trainerId && m.active);
  if (idx === -1) return null;
  const member    = db.members[idx];
  const today     = new Date().toISOString().split('T')[0];
  const periodEnd = calcNextDueDate(today, member.plan);
  db.payments.push({
    id:           nextId(db.payments),
    member_id:    member.id,
    amount:       member.fee_amount,
    paid_date:    today,
    period_start: today,
    period_end:   periodEnd,
    notes:        '',
    created_at:   new Date().toISOString()
  });
  db.members[idx].next_due_date = periodEnd;
  db.members[idx].status = 'paid';
  save(db);
  return { ...db.members[idx], status: 'paid', message: `Fee of Rs.${member.fee_amount} marked as paid. Next due: ${periodEnd}` };
}

function getDashboardStats(trainerId) {
  const db      = load();
  const members = db.members
    .filter(m => m.trainer_id === trainerId && m.active)
    .map(m => ({ ...m, status: computeStatus(m.next_due_date) }));
  const totalMembers   = members.length;
  const activeMembers  = members.filter(m => m.status === 'paid').length;
  const pendingMembers = members.filter(m => m.status !== 'paid').length;
  const now       = new Date();
  const monthStr  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const memberIds = members.map(m => m.id);
  const monthlyRevenue = db.payments
    .filter(p => memberIds.includes(p.member_id) && p.paid_date.startsWith(monthStr))
    .reduce((sum, p) => sum + p.amount, 0);
  const recentMembers = [...members]
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0,5);
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const key   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = d.toLocaleString('default', { month: 'short' });
    const revenue = db.payments
      .filter(p => memberIds.includes(p.member_id) && p.paid_date.startsWith(key))
      .reduce((sum,p) => sum + p.amount, 0);
    monthlyData.push({ month: label, revenue });
  }
  return { totalMembers, activeMembers, pendingMembers, monthlyRevenue, recentMembers, monthlyData };
}

// Seed default trainer
(function seed() {
  const db = load();
  if (!db.trainers.find(t => t.email === 'trainer@truefitness.com')) {
    db.trainers.push({
      id: 1, name: 'Rahul Sharma',
      email: 'trainer@truefitness.com',
      password: bcrypt.hashSync('trainer123', 10),
      created_at: new Date().toISOString()
    });
    save(db);
    console.log('Default trainer created: trainer@truefitness.com / trainer123');
  }
})();

module.exports = { findTrainerByEmail, getMembers, getMemberById, createMember, updateMember, deleteMember, markPaid, getDashboardStats };
