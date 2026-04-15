'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos status');
  const [filterDev, setFilterDev] = useState('Todos devs');
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Aguardando aceitação',
    due_date: '',
    assigneeIds: [] as number[],
    branch: ''
  });

  const router = useRouter();

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/tasks/dashboard'),
        api.get('/tasks'),
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/select');
      const data = res.data;
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    fetchData();
    fetchUsers();
  }, [router]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'Todos status' ||
        (filterStatus === 'Atrasada' && isOverdue(task)) ||
        task.status === filterStatus;

      const matchesDev =
        filterDev === 'Todos devs' ||
        (Array.isArray(task.developer)
          ? task.developer.includes(filterDev)
          : task.developer === filterDev);

      return matchesSearch && matchesStatus && matchesDev;
    });
  }, [tasks, searchTerm, filterStatus, filterDev]);

  function isOverdue(task: any) {
    if (!task.due_date || task.status === 'Concluída') return false;
    return new Date(task.due_date) < new Date();
  }

  const handleOpenModal = (task: any = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        assigneeIds: Array.isArray(task.assigneeIds)
          ? task.assigneeIds.map((id: number | string) => Number(id))
          : [],
        branch: task.branch
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'Aguardando aceitação',
        due_date: '',
        assigneeIds: [],
        branch: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      alert('Erro ao salvar tarefa');
    }
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await api.delete(`/tasks/${editingTask.id}`);
        setIsModalOpen(false);
        fetchData();
      } catch {
        alert('Erro ao excluir tarefa');
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-blue-500 font-black animate-bounce text-2xl tracking-tighter">TASKFLOW</div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={stats?.total} icon="📋" isActive={filterStatus === 'Todos status'} onClick={() => setFilterStatus('Todos status')} />
        <StatCard title="Em andamento" value={stats?.inProgress} icon="🔵" isActive={filterStatus === 'Em andamento'} onClick={() => setFilterStatus(filterStatus === 'Em andamento' ? 'Todos status' : 'Em andamento')} />
        <StatCard title="Atrasadas" value={stats?.overdue} icon="🔴" isActive={filterStatus === 'Atrasada'} onClick={() => setFilterStatus(filterStatus === 'Atrasada' ? 'Todos status' : 'Atrasada')} />
        <StatCard title="Concluídas" value={stats?.done} icon="🟢" isActive={filterStatus === 'Concluída'} onClick={() => setFilterStatus(filterStatus === 'Concluída' ? 'Todos status' : 'Concluída')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Overdue & Developers */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              ⚠️ Atrasadas
            </h3>
            <div className="space-y-3">
              {stats?.overdueList?.slice(0, 5).map((t: any) => (
                <div key={t.id} className="text-sm font-medium text-slate-300 hover:text-white cursor-pointer transition-colors" onClick={() => handleOpenModal(t)}>
                  {t.title}
                </div>
              ))}
              {(!stats?.overdueList || stats.overdueList.length === 0) && (
                <p className="text-xs text-slate-500 italic">Nenhuma tarefa atrasada no momento.</p>
              )}
            </div>
          </section>

          <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              👤 Developers
            </h3>
            <div className="space-y-4">
              {stats?.devs?.map((dev: any) => (
                <div key={dev.developer} className="flex justify-between items-center group cursor-pointer" onClick={() => setFilterDev(dev.developer)}>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white">{dev.developer}</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-black text-blue-400">{dev.total}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Tasks Board */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black text-white">Tarefas</h2>
             <button
               type="button"
               onClick={() => handleOpenModal()}
               className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all text-sm font-bold border border-blue-500/20 cursor-pointer"
               style={{ fontWeight: 700, fontSize: 14 }}
             >
               + Nova
             </button>
           </div>

           {/* Filters & Search */}
           <div className="space-y-4">
               <input
                 type="text"
                 placeholder="Buscar tarefa pelo nome..."
                 className="input"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />

               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                 {['Todos status', 'URGENTE', 'Aguardando aceitação', 'Em andamento', 'Dúvida', 'Para revisão', 'Concluída', 'Atrasada'].map(status => (
                   <button
                     key={status}
                     onClick={() => setFilterStatus(status)}
                     className={`chip ${filterStatus === status ? 'active' : ''}`}
                   >
                     {status}
                   </button>
                 ))}
              </div>

               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                 <button
                   onClick={() => setFilterDev('Todos devs')}
                   className={`chip ${filterDev === 'Todos devs' ? 'active' : ''}`}
                 >
                   Todos devs
                 </button>
                 {stats?.devs?.map((dev: any) => (
                   <button
                     key={dev.developer}
                     onClick={() => setFilterDev(dev.developer === filterDev ? 'Todos devs' : dev.developer)}
                     className={`chip ${filterDev === dev.developer ? 'active' : ''}`}
                   >
                     {dev.developer}
                   </button>
                 ))}
               </div>
           </div>

           {/* Task Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleOpenModal(task)}
                  className={`card ${task.status === 'URGENTE' ? 'urgent-border' : ''}`}
                >
                  <h4 style={{ fontWeight: 700, color: task.status === 'URGENTE' ? '#ff4d4d' : 'white', marginBottom: 4, textTransform: 'uppercase', fontSize: 13 }}>{task.title}</h4>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description || '...'}</p>

                  <div className="status">
                    <div className="status-dot" style={{ background: isOverdue(task) ? '#ef4444' : task.status === 'Concluída' ? '#22c55e' : task.status === 'URGENTE' ? '#ef4444' : '#f59e0b' }}></div>
                    <span style={{ color: isOverdue(task) ? '#ff4d4d' : '#94a3b8' }}>{isOverdue(task) ? 'ATRASADA' : task.status}</span>
                    {task.due_date && <span style={{ color: '#475569', marginLeft: 'auto' }}>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>}
                    {task.developer && (
                      <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 11 }}>
                        {Array.isArray(task.developer) ? task.developer.join(', ') : task.developer}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="col-span-full py-10 text-center text-slate-500 italic text-sm border-2 border-dashed border-white/5 rounded-2xl">
                  Nenhuma tarefa encontrada com estes filtros.
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Modal is already updated in components/Modal.tsx */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título da Tarefa"
            placeholder="Ex: [FEATURE] Implementar algo"
            className="bg-slate-800/50 border-white/5 text-white"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
          <Input
            label="Descrição"
            isTextArea
            rows={4}
            className="bg-slate-800/50 border-white/5 text-white"
            placeholder="Detalhes..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
              <select
                className="w-full bg-slate-800/50 border border-white/5 text-white px-4 py-2 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Aguardando aceitação">Aguardando Aceitação</option>
                <option value="Em andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="URGENTE">URGENTE</option>
                <option value="Dúvida">Dúvida</option>
                <option value="Para revisão">Para revisão</option>
              </select>
            </div>
            <Input
              label="Data Limite"
              type="date"
              className="bg-slate-800/50 border-white/5 text-white"
              value={formData.due_date}
              onChange={e => setFormData({...formData, due_date: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
              Responsável
            </label>
            <p className="text-[11px] text-slate-500">
              Segure Ctrl (Windows) ou Cmd (Mac) para selecionar mais de um responsável.
            </p>

            <select
              multiple
              className="input bg-slate-800/50 border-white/5 text-white min-h-[120px]"
              value={formData.assigneeIds.map(String)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assigneeIds: Array.from(
                    e.target.selectedOptions,
                    (option) => Number(option.value),
                  ),
                })
              }
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Branch"
            placeholder="Ex: nome_branch_tarefa"
            className="bg-slate-800/50 border-white/5 text-white"
            value={formData.branch}
            onChange={e => setFormData({...formData, branch: e.target.value})}
            required
          />
          <div style={{ display: 'flex', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
            <button type="submit" className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all text-sm font-bold border border-blue-500/20" style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>Salvar Alterações</button>
            {editingTask && (
              <button type="button" className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-bold border border-red-500/20" onClick={handleDelete} style={{ fontWeight: 700, fontSize: 14 }}>Excluir</button>
            )}
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StatCard({ title, value, icon, onClick, isActive }: { title: string, value: number, icon: string, onClick?: () => void, isActive?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={`kpi ${isActive ? 'active' : ''}`}
    >
      <div>{icon} {value || 0}</div>
      <span>{title}</span>
    </div>
  );
}
