'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Modal } from '@/components/Modal';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    roles: [] as number[],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles'),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError('Não foi possível carregar os dados. Verifique se você está logado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEditModal = (user: any) => {
    const userRoleIds = (user.roles || []).map((r: any) => {
      // Handle both { role: { id } } and { role_id } structures
      return r?.role?.id ?? r?.role_id ?? r;
    }).filter(Boolean);

    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      password: '',
      roles: userRoleIds,
    });
    setSaveError('');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', email: '', password: '', roles: [] });
    setSaveError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    
    // Clean payload - don't send empty password on edit
    const payload: any = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      roles: formData.roles,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, payload);
      } else {
        if (!formData.password) {
          setSaveError('Senha é obrigatória para novos usuários.');
          return;
        }
        payload.password = formData.password;
        await api.post('/users', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      const msg = err?.response?.data?.message || err?.message || 'Erro desconhecido';
      setSaveError(`Falha ao salvar: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err: any) {
      alert('Erro ao excluir: ' + (err?.response?.data?.message || err?.message));
    }
  };

  const toggleRole = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-blue-500 font-black animate-bounce text-2xl tracking-tighter">Carregando...</div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-red-400">{error}</p>
      <button onClick={fetchData} className="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold">Tentar novamente</button>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-blue-500 font-black tracking-widest uppercase text-[10px] mb-1">Administração</p>
          <h1 className="text-4xl font-black text-white leading-none">Usuários</h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all text-sm font-bold border border-blue-500/20"
          style={{ fontWeight: 700, fontSize: 14 }}
        >
          + Novo Usuário
        </button>
      </header>

      {/* Table */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Contato</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Papéis</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-slate-500 italic">Nenhum usuário cadastrado.</td></tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-lg border border-blue-500/20">
                      {(user.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-slate-300 font-medium">{user.email}</td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1.5">
                    {(user.roles || []).map((r: any) => (
                      <span key={r.role?.id ?? r.role_id} className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-blue-500/20">
                        {r.role?.name ?? '?'}
                      </span>
                    ))}
                    {(!user.roles || user.roles.length === 0) && (
                      <span className="text-slate-600 italic text-xs">Sem papel</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all text-sm font-bold border border-blue-500/20"
                      style={{ fontWeight: 700, fontSize: 14 }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-bold border border-red-500/20"
                      style={{ fontWeight: 700, fontSize: 14 }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Editando: ${editingUser.name}` : 'Novo Colaborador'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {saveError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">
              {saveError}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
            <input
              className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Nome completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
              <input
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                required
                placeholder="username"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
              <input
                type="email"
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Senha {editingUser && <span className="text-slate-600 normal-case font-medium">(deixe vazio para não alterar)</span>}
            </label>
            <input
              type="password"
              className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              placeholder={editingUser ? 'Nova senha (opcional)' : 'Senha obrigatória'}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Papéis / Nível de Acesso</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-xl border border-white/5">
              {roles.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    formData.roles.includes(role.id)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-700 border-white/5 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600">Selecionados: {formData.roles.length} papel(is)</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all text-sm font-bold border border-blue-500/20"
              style={{ fontWeight: 700, fontSize: 14 }}
            >
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all border border-slate-600"
              style={{ fontWeight: 700, fontSize: 14 }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
