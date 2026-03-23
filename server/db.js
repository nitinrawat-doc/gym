const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.error('❌ MongoDB error:', err));

const trainerSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const memberSchema = new mongoose.Schema({
  trainer_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  name:          { type: String, required: true },
  phone:         { type: String, required: true },
  plan:          { type: String, enum: ['monthly','quarterly','yearly'], required: true },
  fee_amount:    { type: Number, required: true },
  joining_date:  { type: String, required: true },
  next_due_date: { type: String, required: true },
  active:        { type: Boolean, default: true },
  created_at:    { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  member_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount:       { type: Number, required: true },
  paid_date:    { type: String, required: true },
  period_start: { type: String, required: true },
  period_end:   { type: String, required: true },
  notes:        { type: String, default: '' },
  created_at:   { type: Date, default: Date.now }
});

const Trainer = mongoose.model('Trainer', trainerSchema);
const Member  = mongoose.model('Member',  memberSchema);
const Payment = mongoose.model('Payment', paymentSchema);

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

function fmt(m) {
  const obj = m.toObject ? m.toObject() : m;
  return { ...obj, id: obj._id, status: computeStatus(obj.next_due_date) };
}

async function seedTrainer() {
  const exists = await Trainer.findOne({ email: 'trainer@truefitness.com' });
  if (!exists) {
    await Trainer.create({
      name: 'Rahul Sharma',
      email: 'trainer@truefitness.com',
      password: bcrypt.hashSync('trainer123', 10)
    });
    console.log('✅ Default trainer created');
  }
}
seedTrainer();

async function findTrainerByEmail(email) {
  return await Trainer.findOne({ email: email.toLowerCase().trim() });
}

async function getMembers(trainerId, { search, status } = {}) {
  const query = { trainer_id: trainerId, active: true };
  if (search) query.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } }
  ];
  let members = await Member.find(query).sort({ created_at: -1 });
  members = members.map(fmt);
  if (status && status !== 'all') members = members.filter(m => m.status === status);
  return members;
}

async function getMemberById(id, trainerId) {
  const m = await Member.findOne({ _id: id, trainer_id: trainerId, active: true });
  if (!m) return null;
  const payments = await Payment.find({ member_id: id }).sort({ paid_date: -1 });
  return { ...fmt(m), payments: payments.map(p => ({ ...p.toObject(), id: p._id })) };
}

async function createMember(trainerId, data) {
  // ✅ FIX: joining_date ko next_due_date set karo
  // Status automatically pending/overdue aayega computeStatus se
  // Koi payment record nahi banate — member ne abhi fee nahi di
  const member = await Member.create({
    trainer_id:    trainerId,
    name:          data.name.trim(),
    phone:         data.phone.trim(),
    plan:          data.plan,
    fee_amount:    Number(data.fee_amount),
    joining_date:  data.joining_date,
    next_due_date: data.joining_date  // ✅ Due date = joining date (turant pending)
  });
  return fmt(member);
}

async function updateMember(id, trainerId, data) {
  const old = await Member.findOne({ _id: id, trainer_id: trainerId, active: true });
  if (!old) return null;
  const plan = data.plan || old.plan;
  const next_due_date = plan !== old.plan
    ? calcNextDueDate(old.joining_date, plan)
    : old.next_due_date;
  const updated = await Member.findByIdAndUpdate(id, {
    name:       data.name       || old.name,
    phone:      data.phone      || old.phone,
    plan,
    fee_amount: data.fee_amount != null ? Number(data.fee_amount) : old.fee_amount,
    next_due_date
  }, { new: true });
  return fmt(updated);
}

async function deleteMember(id, trainerId) {
  const result = await Member.findOneAndUpdate(
    { _id: id, trainer_id: trainerId, active: true },
    { active: false }
  );
  return !!result;
}

async function markPaid(memberId, trainerId) {
  const member = await Member.findOne({ _id: memberId, trainer_id: trainerId, active: true });
  if (!member) return null;
  const today     = new Date().toISOString().split('T')[0];
  const periodEnd = calcNextDueDate(today, member.plan);

  // ✅ Payment record banao — tabhi revenue count hoga
  await Payment.create({
    member_id:    member._id,
    amount:       member.fee_amount,
    paid_date:    today,
    period_start: today,
    period_end:   periodEnd
  });

  // ✅ Next due date update karo
  const updated = await Member.findByIdAndUpdate(
    memberId,
    { next_due_date: periodEnd },
    { new: true }
  );
  return {
    ...fmt(updated),
    status: 'paid',
    message: `Fee of Rs.${member.fee_amount} marked as paid. Next due: ${periodEnd}`
  };
}

async function getDashboardStats(trainerId) {
  const members        = (await Member.find({ trainer_id: trainerId, active: true })).map(fmt);
  const totalMembers   = members.length;
  const activeMembers  = members.filter(m => m.status === 'paid').length;
  const pendingMembers = members.filter(m => m.status !== 'paid').length;
  const memberIds      = members.map(m => m._id);

  const now      = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  // ✅ Revenue sirf actual payments se — member add karne se nahi
  const monthlyPay = await Payment.find({
    member_id: { $in: memberIds },
    paid_date: { $regex: `^${monthStr}` }
  });
  const monthlyRevenue = monthlyPay.reduce((s,p) => s + p.amount, 0);

  const recentMembers = [...members]
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const key   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = d.toLocaleString('default', { month: 'short' });
    const pays  = await Payment.find({
      member_id: { $in: memberIds },
      paid_date: { $regex: `^${key}` }
    });
    monthlyData.push({ month: label, revenue: pays.reduce((s,p) => s + p.amount, 0) });
  }

  return { totalMembers, activeMembers, pendingMembers, monthlyRevenue, recentMembers, monthlyData };
}

module.exports = {
  findTrainerByEmail, getMembers, getMemberById,
  createMember, updateMember, deleteMember,
  markPaid, getDashboardStats
};
